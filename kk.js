var glosa = '0332fd3d6bbc2e0420b70012710260008908c709bf';


var fecha = (parseInt('0x' + glosa.substr(14, 6),16));
console.log('fecha: '+fecha);
var time = (parseInt('0x' + glosa.substr(20, 6),16)); 
console.log('time: '+time);

                                    
                     if(time.toString().length === 4){
                         time = '00'+time;
                         console.log('time: '+time);
                     }        
                     else if(time.toString().length === 5){
                         time = '0'+time;
                         console.log('time: '+time);
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
                      console.log('2010-10-10 10:10:10.000');
                  }          
              
              
              //console.log('Fecha: ' + fechaLpro + '\r\n');
              //----------------------------------------------------------------------
              var signo = (glosa.substr(0,2));
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

               var latitud = Ysigno+(parseInt('0x' + glosa.substr(2,6),16)/100000);                
               var longitud = Xsigno+(parseInt('0x' + glosa.substr(8,6),16)/100000);
               var altitud = (parseInt('0x' + glosa.substr(26,4),16));   
               var dhop = (parseInt('0x' + glosa.substr(30,4),16)/100);
               var temperatura = (parseInt('0x' + glosa.substr(34,4),16)/100);  
               var voltaje = (parseInt('0x' + glosa.substr(38,4),16));    
                             
               if (dhop === '' || dhop === ' ' || dhop === null)
                   dhop = 0;            
               if (temperatura === '' || temperatura === ' ' || temperatura === null)
                   temperatura = 0;              
               if (altitud === '' || altitud === ' ' || altitud === null)
                   altitud = 0;        
               
               console.log('fecha lpro:' + fechaLpro + ' ' +                             
                                'voltaje:' + voltaje + ' ' +
                                'dhop:' + dhop + ' ' +
                                'temperatura:' + temperatura + ' ' +
                                'X:' + longitud + ' ' +
                                'Y:' + latitud + ' ' +
                                'Z:' + altitud + ' '
                            );          