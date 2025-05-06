import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'entries.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
  }
};

// Get all entries
export async function GET() {
  try {
    ensureDataDir();
    
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    const entries = JSON.parse(fileContent);
    
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error reading entries:', error);
    return NextResponse.json({ error: 'Failed to read entries' }, { status: 500 });
  }
}

// Save entries
export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    
    const entries = await request.json();
    fs.writeFileSync(dataFilePath, JSON.stringify(entries, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving entries:', error);
    return NextResponse.json({ error: 'Failed to save entries' }, { status: 500 });
  }
}
