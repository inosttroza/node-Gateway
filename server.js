//---------String de conexion a bd-----------------------------------------------
const sql = require('mssql')
var bdConfig = {
    user: 'sa',
    password: 'sa12345.',
    server: 'NB-PINOSTROZA\\MSSQLSERVER2016',
    database: 'Pruebas',
    options: {
        encrypt: false // Si usa Windows Azure. Poner "encrypt: true"
    }
};

 //--------------Inicio cargo arreglo con ID y CODCARD para ingresar ID de Ldevice en tabla LPRODATA--------------------------------------------------
var LproArray = []
 let getArrayLdevice = (async function(){
                       try {
                           let pool = await sql.connect(bdConfig)
                           let result1 = await pool.request()                
                               .query(`select ID,CODCARD from LDEVICE WHERE CODCARD <> ${"' '"} and CODCARD is not null`)
                            
                             for (const key in result1) {                  
                              LproArray.push(result1[key]);
                              } 
                               //console.log(LproHash[0][0]);        
                               //return LproArray[0][0].filter(x => x.CODCARD == codCard)[0].ID;  
                               return LproArray; 

                       } catch (error) {
                           console.log(`Error en LproArray: ${error}`);    
                           return [];
                       }
                         finally{
                            sql.close();            
                         }   
                   })


let getArray = async() => {                
    return await getArrayLdevice(); 
}                             
 getArray()
 .then(function(resul) {                                     
       return resul;
 })
 .catch(function(error){
     return error;         
 });


//--------------Creo socket, me conecto y extraigo data del gateway-------------------------------------------------- 
  //#!/usr/bin/env node
  var W3CWebSocket = require('websocket').w3cwebsocket;
  var client = new W3CWebSocket('ws://192.168.3.65:8088/WebSocketServer/DeviceMsg/?type=node&token=d21e397343d196ff5438d7ed7cb58ee8');
  client.onerror = function() {
      console.log('Connection Error');
  };
  client.onopen = function() {
      console.log('Conexión Abierta, Puedes enviar y recibir mensajes');
      // function sendRespuesta() {
      //     if (client.readyState === client.OPEN) {
      //         var number = Math.round(Math.random() * 0xFFFFFF);
      //         client.send(number.toString());
      //         setTimeout(sendRespuesta, 1000);
      //     }
      // }
      // sendRespuesta();
  };
  client.onclose = function() {
      console.log('Conexión Cerrada');
  };
  client.onmessage = function(e) {
      if (typeof e.data === 'string') {
          //if (e.data.indexOf('Payload') !== -1) {
          if (e.data.indexOf('"CommType":"comm_rx"') !== -1) {
              //console.log("Received: '" + e.data + "'");
              //----------------------------------------------------------------------
              var pk = e.data;
              pk = pk.split("DevAddr")[1].split("Port")[0];
              pk = replaceAll(pk, '"', '');
              pk = replaceAll(pk, ':', '');
              pk = replaceAll(pk, ',', '');
              pk = replaceAll(pk, "\\", "");                
              //console.log('PK: ' + pk + '\r\n');          
              //----------------------------------------------------------------------               
                var idLdevice = LproArray[0][0].filter(x => x.CODCARD == pk)[0].ID;  
                //console.log(idLdevice);
              //----------------------------------------------------------------------
              var rssi = e.data;
              rssi = rssi.split("rssi")[1].split("adr")[0];
              rssi = replaceAll(rssi, '"', '');
              rssi = replaceAll(rssi, ':', '');
              rssi = replaceAll(rssi, ',', '');
              rssi = replaceAll(rssi, "\\", "");
              rssi = replaceAll(rssi, "}", "");
              rssi = replaceAll(rssi, "]", "");
              //console.log('RSSI: ' + rssi + '\r\n');
              //----------------------------------------------------------------------
              var snr = e.data;
              snr = snr.split("loRaSNR")[1].split("longitude")[0];
              snr = replaceAll(snr, '"', '');
              snr = replaceAll(snr, ':', '');
              snr = replaceAll(snr, ',', '');
              snr = replaceAll(snr, "\\", "");
              //console.log('SNR: ' + snr + '\r\n');
              //----------------------------------------------------------------------
              var mac = e.data;
              mac = mac.split("mac")[1].split("name")[0];
              mac = replaceAll(mac, '"', '');
              mac = replaceAll(mac, ':', '');
              mac = replaceAll(mac, ',', '');
              mac = replaceAll(mac, "\\", "");
              //console.log('MAC: ' + mac + '\r\n');
              //----------------------------------------------------------------------
              var msje = e.data;
              msje = msje.split("Payload")[1].split("DT")[0];
              msje = replaceAll(msje, '"', '');
              msje = replaceAll(msje, ':', '');
              msje = replaceAll(msje, ',', '');
              msje = replaceAll(msje, "\\", "");              
              //console.log('Payload: ' + msje + '\r\n');
              //----------------------------------------------------------------------           
            
              if(msje === "000000000000000000000000000000000000000000"){ 
                var fechaLpro = '2000-01-01 00:00:00.000';            
                console.log('Pk:' + pk + ' ' +
                            'idLdevice:' + idLdevice + ' ' +
                            'fecha lpro:' + fechaLpro + ' ' +
                                'Rssi:' + rssi + ' ' +
                                'Snr:' + snr + ' ' +
                                'Mac:' + mac + ' ' +
                                'voltaje:' + 0 + ' ' +
                                'dhop:' + 0 + ' ' +
                                'temperatura:' + 0 + ' ' +
                                'X:' + 0 + ' ' +
                                'Y:' + 0 + ' ' +
                                'Z:' + 0 + ' '
                            );          
                insertBd(pk,idLdevice, fechaLpro, mac, snr, rssi, 0, 0, 0, 0, 0, 0); 
              }  
              else{   
              
              var fecha = (parseInt('0x' + msje.substr(14, 6),16));
              var time = (parseInt('0x' + msje.substr(20, 6),16));   
              if(time.toString().length === 4){
                  time = '00'+time;                
              }        
              else if(time.toString().length === 5){
                  time = '0'+time;               
              }     
               var ms = Date.parse('20' + fecha.toString().substr(4, 2) + '-' + fecha.toString().substr(2, 2) + '-' + fecha.toString().substr(0, 2) +
                 ' ' + time.toString().substr(0, 2) + ':' + time.toString().substr(2, 2) + ':' + time.toString().substr(4, 2));
               var fechaLpro = new Date(ms).toLocaleString('es-CL', {
                   year: "numeric",
                   month: "2-digit",
                   day: "2-digit",
                   hour: "2-digit",
                   minute: "2-digit",
                   second: "2-digit",
                   hour12: false
               });
               if(fechaLpro === 'Invalid Date'){
                  fechaLpro ='2010-10-10 10:10:10.000';
               }
              //console.log('Fecha: ' + fechaLpro + '\r\n');
              //----------------------------------------------------------------------
              var signo = (msje.substr(0,2));
              //console.log('signo: ' + signo + '\r\n');
              var Ysigno = '+';
              var Xsigno = '+';
             if(signo == 1){
                Ysigno = '-';
                Xsigno = '+';
              }             
              else if(signo == 2){
                Ysigno = '+';
                Xsigno = '-';
              }              
              else if(signo == 3){
                Ysigno = '-';
                Xsigno = '-';
              }     
              //----------------------------------------------------------------------        

               var latitud = Ysigno+(parseInt('0x' + msje.substr(2,6),16)/100000);                
               var longitud = Xsigno+(parseInt('0x' + msje.substr(8,6),16)/100000);
               var altitud = (parseInt('0x' + msje.substr(26,4),16));   
               var dhop = (parseInt('0x' + msje.substr(30,4),16)/100);
               var temperatura = (parseInt('0x' + msje.substr(34,4),16)/100);  
               var voltaje = (parseInt('0x' + msje.substr(38,4),16));    
                             
               if (dhop === '' || dhop === ' ' || dhop === null)
                   dhop = 0;            
               if (temperatura === '' || temperatura === ' ' || temperatura === null)
                   temperatura = 0;              
               if (altitud === '' || altitud === ' ' || altitud === null)
                   altitud = 0;        
               
               console.log('Pk:' + pk + ' ' +
                            'idLdevice:' + idLdevice + ' ' +
                            'fecha lpro:' + fechaLpro + ' ' +
                                'Rssi:' + rssi + ' ' +
                                'Snr:' + snr + ' ' +
                                'Mac:' + mac + ' ' +
                                'voltaje:' + voltaje + ' ' +
                                'dhop:' + dhop + ' ' +
                                'temperatura:' + temperatura + ' ' +
                                'X:' + longitud + ' ' +
                                'Y:' + latitud + ' ' +
                                'Z:' + altitud + ' '
                            );          
             
              insertBd(pk,idLdevice, fechaLpro, mac, snr, rssi, voltaje, dhop, temperatura, longitud, latitud, altitud); 
            }           
          }
      }
  };

 
  //-------Reemplazo caracteres no deseados-------------------------------------------------------------------------------
  function replaceAll(string, token, newtoken) {
      if (token != newtoken)
          while (string.indexOf(token) > -1) {
              string = string.replace(token, newtoken);
          }
      return string;
  }

  //-------Inserto registro en bd-------------------------------------------------------------------------------
function insertBd(idGateway,idLdevice,fechaLpro, mac, snr, rssi, voltaje, dhop, temperatura, longitud, latitud, altitud) {
    (async function() {
        try {
            let pool = await sql.connect(bdConfig)
            let result2 = await pool.request()
                .input('IDGATEWAY', sql.VarChar, idGateway)
                .input('LDEVICEID', sql.VarChar, idLdevice)
                .input('DPROTIMESTAMP', sql.DateTime2, fechaLpro)
                .input('MAC', sql.VarChar, mac)
                .input('SNR', sql.Float, snr)
                .input('RSSI', sql.Float, rssi)
                .input('VOLTAJE', sql.Int, voltaje)
                .input('DHOP', sql.Float, dhop)
                .input('TEMPERATURA', sql.Float, temperatura)
                .input('X', sql.Float, longitud)
                .input('Y', sql.Float, latitud)
                .input('Z', sql.Float, altitud)
                //.output('output_parameter', sql.VarChar(50))
                .execute('INSERT_LDPRODATA')
                //console.dir(result2)
        } catch (error) {
            console.log(`Error al insertar: ${error}`);
            sql.close();
        }
        sql.close();
    })()
}





