const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupNgrok() {
  console.log('Setting up ngrok...');
  
  // Ask for auth token
  const token = await new Promise(resolve => {
    rl.question('Please enter your ngrok auth token: ', answer => {
      resolve(answer);
    });
  });

  try {
    // Configure ngrok with auth token
    execSync(`ngrok config add-authtoken ${token}`);
    console.log('✅ ngrok setup completed successfully!');
    console.log('You can now run `yarn web:tunnel` to start the tunnel');
  } catch (error) {
    console.error('❌ Error setting up ngrok:', error.message);
  } finally {
    rl.close();
  }
}

setupNgrok();