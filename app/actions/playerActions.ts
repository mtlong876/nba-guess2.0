'use server';

import fs from 'fs';
import path from 'path';
import { neon } from "@neondatabase/serverless";
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
const difficulties = ["easy", "medium", "hard", "chaos", "recentP", "recentS"];

export async function generateDailyData() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set.');
    }
    const sql = neon(databaseUrl);
    const players: Record<string, string> = {};
    difficulties.forEach(difficulty => {
      const dataArray = loadFileToArray(difficulty);
      players[difficulty] = getRandomEntry(dataArray);
    });
    const currentTime = Math.floor(Date.now() / 1000);
    let query = `INSERT INTO daily VALUES (${currentTime}`;
    difficulties.forEach(difficulty => {
        const safeValue = players[difficulty].replace(/'/g, "''");
        query += `, '${safeValue}'`;
    });
    query += ");";

    await sql.query(query);
    revalidateTag('dailyData'); // Revalidate the cache for daily data
}


const getDailyData = unstable_cache(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set.');
    }
    const sql = neon(databaseUrl);
    const data = await sql`SELECT * FROM daily ORDER BY time_stamp DESC LIMIT 1;`;
    console.log('Data loaded from database:', data);
    return data;
}, ['dailyData'],{
  tags: ['dailyData']
})

export async function getDailyId(){
  const dailyData = await getDailyData();
  return dailyData[0].time_stamp;
}

function loadFileToArray(difficulty: string): string[] {
  const filepath = path.join(process.cwd(), './app/difficulties/', `${difficulty}.txt`);
  const fileContent = fs.readFileSync(filepath, 'utf-8');
  return fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
}

function getRandomEntry(array: string[]): string {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function loadCSVToObject(filename: string): { [key: string]: string }[] {
  const filepath = path.join(process.cwd(), './app/players/', filename);
  const fileContent = fs.readFileSync(filepath, 'utf-8');
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',');
  
  const columnsToInclude = [
    { original: 'SEASON_ID', display: 'Season' },
    { original: 'TEAM_ABBREVIATION', display: 'Team' },
    { original: 'MIN', display: 'MIN' },
    // { original: 'GP', display: 'GP' },
    // { original: 'GS', display: 'GS' },
    { original: 'GP_GS', display: 'GP/GS' },
    { original: 'PTS', display: 'PTS' },
    { original: 'REB', display: 'REB' },
    { original: 'AST', display: 'AST' },
    { original: 'STL', display: 'STL' },
    { original: 'BLK', display: 'BLK' },
    // { original: 'TOV', display: 'TOV' },
    // { original: 'PF', display: 'PF' },
    { original: 'FG_PCT', display: 'FG%' },
    { original: 'FG3_PCT', display: '3P%' },
    { original: 'FT_PCT', display: 'FT%' },
  ];

  // Same processing logic as before...
  const allRows = lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: { [key: string]: string } = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      obj[header.trim()] = value === '' ? '-' : value;
    });
    
    return obj;
  });

  const processedRows = allRows.map((row) => {
    if (row['TEAM_ABBREVIATION'] === 'TOT') {
      const season = row['SEASON_ID'];
      const teamsInSeason = allRows
        .filter(r => r['SEASON_ID'] === season && r['TEAM_ABBREVIATION'] !== 'TOT')
        .map(r => r['TEAM_ABBREVIATION']);
      
      row['TEAM_ABBREVIATION'] = teamsInSeason.join('/');
    }
    return row;
  });

  const uniqueRows = processedRows.filter((row) => {
    const season = row['SEASON_ID'];
    const hasTotRow = processedRows.some(r => r['SEASON_ID'] === season && r['TEAM_ABBREVIATION'].includes('/'));
    
    if (hasTotRow) {
      return row['TEAM_ABBREVIATION'].includes('/');
    }
    
    return true;
  });

  return uniqueRows.map(row => {
    const obj: { [key: string]: string } = {};
    const games = parseFloat(row['GP']) || 1;
    
    columnsToInclude.forEach(column => {
      if (column.original === 'GP_GS') {
        // Combine GP and GS
        const gp = row['GP'] ?? '-';
        const gs = row['GS'] ?? '-';
        obj[column.display] = `${gp}/${gs}`;
        return;
      }
      const value = row[column.original];
      
      if (!value || value === '-') {
        obj[column.display] = '-';
        return;
      }
      
      if (column.original === 'PLAYER_AGE') {
        const ageValue = parseFloat(value);
        obj[column.display] = isNaN(ageValue) ? '-' : Math.floor(ageValue).toString();
        return;
      }
      
      if (['PTS', 'REB', 'AST', 'STL', 'BLK', 'TOV', 'PF', 'MIN'].includes(column.original)) {
        const statValue = parseFloat(value);
        if (isNaN(statValue)) {
          obj[column.display] = '-';
        } else {
          const perGameValue = games > 0 ? (statValue / games).toFixed(1) : '0.0';
          obj[column.display] = perGameValue;
        }
      } else {
        obj[column.display] = value;
      }
    });
    
    return obj;
  });
}
export async function getDailyName(difficulty: string) {
  const dailyData = await getDailyData();
  const playerFilename = dailyData[0][difficulty.toLowerCase()];
  const actualPlayerName = playerFilename
    .replace('.csv', '')
    .replace(/_\d+$/, '') // Remove ID at end
    .replace(/_/g, ' ');
  return actualPlayerName;
}

export async function getDailyInitials(difficulty: string) {
    const name = await getDailyName(difficulty);
    const parts = name.split(' ');
    if (parts.length < 2) {
        return name.charAt(0).toUpperCase(); // Return first letter if no last name
    }
    const initials: string = parts.map((part: string) => part.charAt(0).toUpperCase()).join('');
    return initials;
}
export async function checkPlayerGuess(guess: string, playerFilename: string): Promise<{ correct: boolean; message: string , playerName?: string }> {
  try {
    // Extract player name from filename (remove .csv and ID)
    const actualPlayerName = playerFilename
      .replace('.csv', '')
      .replace(/_\d+$/, '') // Remove ID at end
      .replace(/_/g, ' '); // Replace underscores with spaces    
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedActual = actualPlayerName.toLowerCase().trim();
    console.log(`Checking guess: ${normalizedGuess} against actual: ${normalizedActual}`);
    if (normalizedGuess === normalizedActual) {
      return {
        correct: true,
        message: `🎉 Correct! It was ${actualPlayerName}!`,
        playerName: actualPlayerName // Return the actual player name for display
      };
    } else {
      return {
        correct: false,
        message: `❌ Incorrect. Try again!`
      };
    }
  } catch (error) {
    return {
      correct: false,
      message: 'Error checking guess. Please try again.'
    };
  }
}

export async function checkDailyGuess(guess: string, difficulty: string) {
  try{
      //const difficultyFile: keyof typeof daily = difficulties[difficulty] as keyof typeof daily;
      const dailyData = await getDailyData();
      const playerFilename = dailyData[0][difficulty.toLowerCase()];
      const actualPlayerName = playerFilename
        .replace('.csv', '')
        .replace(/_\d+$/, '') // Remove ID at end
        .replace(/_/g, ' '); // Replace underscores with spaces    
      const normalizedGuess = guess.toLowerCase().trim();
      const normalizedActual = actualPlayerName.toLowerCase().trim();
      console.log(`Checking guess: ${normalizedGuess} against actual: ${normalizedActual}`);
      if (normalizedGuess === normalizedActual) {
        return {
          correct: true,
          message: `🎉 Correct! It was ${actualPlayerName}!`
        };
      } else {
        return {
          correct: false,
          message: `❌ Incorrect. Try again!`
        };
      }
    } catch (error) {
      return {
        correct: false,
        message: 'Error checking guess. Please try again.'
      };
  }
}

export async function getPlayerData(difficulty: string, daily: boolean) {
  let player: string;
  const dailyData = await getDailyData();
  if (!daily) {
    const dataArray = loadFileToArray(difficulty);
    player = getRandomEntry(dataArray);
  } else {
    //player = dailyFile[difficulty];
    player = dailyData[0][difficulty.toLowerCase()];
  }

  const csvData = loadCSVToObject(player);
  if (daily) {
    player = "NOCHEATING"
  }
  console.log(`Loaded data for player: ${player}`);
  // Return both the data and the player filename for guess checking
  return {
    csvData,
    playerFilename: player
  };
}

// Add this function to your existing playerActions.ts
export async function getAllPlayerNames(): Promise<string[]> {
  try {
    const filepath = path.join(process.cwd(), './app/difficulties/', 'all.txt');
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    
    return fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(filename => {
        // Remove .csv extension and player ID
        return filename
          .replace('.csv', '')
          .replace(/_\d+$/, '') // Remove ID at end
          .replace(/_/g, ' ') // Replace underscores with spaces
          .trim();
      })
      .sort(); // Sort alphabetically
  } catch (error) {
    console.error('Error reading player names:', error);
    return [];
  }
}