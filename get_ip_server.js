const fs = require('fs');
const os = require('os');

const getConnectedIPAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  let ethernetAddress = '127.0.0.1';
  let wifiAddress = null;

  for (const interfaceKey of Object.keys(networkInterfaces)) {
    console.log(interfaceKey);
    for (const interfaceObj of networkInterfaces[interfaceKey]) {
      if (interfaceObj.family === 'IPv4') {
        console.log(interfaceObj);
        if (!interfaceObj.internal) {
          if (interfaceKey.toLowerCase().includes('eth') || interfaceKey.toLowerCase().includes('en')) {
            ethernetAddress = interfaceObj.address;
          }
          if (interfaceKey.toLowerCase().includes('wlan') || interfaceKey.toLowerCase().includes('wi-fi')) {
            wifiAddress = interfaceObj.address;
          }
        }
      }
    }
  }

  console.log(ethernetAddress);
  console.log(wifiAddress);
  
  if (!wifiAddress) {
    return ethernetAddress;
  } else {
    if (ethernetAddress !== '127.0.0.1') {
      return ethernetAddress;
    } else {
      return wifiAddress;
    }
  }
};

const connectedIPAddress = getConnectedIPAddress();
console.log('Dirección IP conectada:', connectedIPAddress);

const ip_servidor = `${connectedIPAddress}`;

const data = {
  ip_servidor: ip_servidor
};
console.log(data);

// Convertir los datos a formato JSON
const jsonData = JSON.stringify(data, null, 2);

// Escribir el JSON en un archivo
fs.writeFileSync('ip_servidor.json', jsonData);

console.log('Archivo JSON creado exitosamente.');