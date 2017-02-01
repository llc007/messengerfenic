const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const APP_TOKEN = 'EAAEmJSmqdNwBADEJ8WdEJF08mwX5vdGr2hjZAu3Baed7ScHhslbPzzqZCFGuWj1iA0ZChhMrHNGVGhBTJCJNEdAHA2BEykRWud73CTiNmlRgbGT8mjZAwogdCZBod2aEy701PeAABuhAuAZCnKmCTfbrVDiolGJfJZAN4CRV3aoaAZDZD'

var app = express()
var cadena = ""
app.use(bodyParser.json())
var activado =true
var PORT = process.env.PORT || 3000;

app.listen(PORT,function(){
	console.log('Server listen localhost:3000')
})

app.get('/',function(req, res){
	res.send('Abriendo el puerto desde mi pc Local con http://ngrok.com')
})

app.get('/webhook',function(req, res){
	if(req.query['hub.verify_token'] === 'hello_token'){
		res.send(req.query['hub.challenge'])
	}else{
		res.send('Tu no tienes que entrar aqui')
	}
})
function escribirLog(text){
	cadena=cadena.concat('\n'+text)
app.get('/log',function(req, res){
	res.send(cadena)
})
}
app.post('/webhook',function(req, res){
	var data = req.body
	
	if(data.object == 'page'){
		
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.message){					
					getMessage(messagingEvent)
				}
			})
		})
	}
	res.sendStatus(200)
})

function getMessage(event){
	var senderID = event.sender.id
	var messageText = event.message.text
	escribirLog("la id es: " + senderID)
	evaluarMensaje(senderID, messageText)
}

function evaluarMensaje(senderID, messageText){
	var mensaje = '';
	if(activado){
		if(isContain(messageText,'ayuda')){
			mensaje = 'Hola Soy FenicBot puedo ayudarte con algunas tareas sencillas, como darte informacion de FENIC'
		}else if(isContain(messageText,'info')){
			mensaje = 'Hola!! Gracias por comunicarte con Fenic \npuedes enviarnos un correo a hola@fenicweb.cl \no hablarnos al WhatsApp +569 90583957'
		}else if(isContain(messageText,'perro')){
			enviarMensajeImagen(senderID)
		}else if(isContain(messageText,'perfil')){
			enviarMensajeTemplate(senderID)
		}else if(isContain(messageText,'clima') || isContain(messageText,'temperatura')|| isContain(messageText,'Clima')){
			//getClima(function(_temperatura){
				//enviarMensajeTexto(senderID, getMessageCLima(_temperatura))
				//enviarMensajeTexto(senderID, getMessageCLima(24))
				mensaje = 'Tenemos 24°, es un dia agradable para salir.'
			//})
		}else if(isContain(messageText,'desactivar') && senderID ==1250582101702601){
			mensaje = 'Me desactivo el lucho lopez'
			activado = false;
		}else{
			mensaje = 'Hola, Gracias por comunicarte con Fenic, Te responderemos a la brevedad...\npara mayor informacion, visita www.fenicweb.cl'
			mensaje = mensaje.concat('Ahora te podemos dar la siguiente informacion:')
			mensaje = mensaje.concat('Preguntame por precios, informacion, clima o ayuda')
			mensaje = mensaje.concat('solo escribe lo que necesitas ;)')
		
		}

		enviarMensajeTexto(senderID, mensaje)
	}else if(isContain(messageText,'activar') && senderID ==1250582101702601){
		mensaje = 'Estoy activado'
		activado=true;
	}

}

function enviarMensajeTemplate(senderID){
	var messageData = {
		recipient: {
			id : senderID
		},
		message: {
			attachment :{
				type: "template",
				payload: {
					template_type: 'generic',
					elements: [elementTemplate()]
				}
			}
		}
	}

	callSendAPI(messageData)
}

function elementTemplate(){
	return {
		title: "Fenic",
		subtitle: "Paginas web y soporte informatico",
		item_url: "http://fenicweb.cl",
		image_url: "https://raw.githubusercontent.com/llc007/llc007.github.io/master/img/BannerFacebook.jpg",
		buttons: [
			buttonTemplate('Contactanos','hola@fenic.cl'),
			buttonTemplate('Portafolio','http://fenicweb.cl/')
		]
	}
}

function buttonTemplate(title,url){
	return {
		type: 'web_url',
		url: url,
		title: title
	}
}

//enviar imagen

function enviarMensajeImagen(senderID){
	var messageData = {
		recipient : {
			id: senderID
		},
		message:{
			attachment:{
				type: "image",
				payload: {
					url: 'https://s-media-cache-ak0.pinimg.com/564x/ef/e8/ee/efe8ee7e20537c7af84eaaf88ccc7302.jpg'
				}

			}
		}
	}

	callSendAPI(messageData)
}
//enviar texto plano
function enviarMensajeTexto(senderID, mensaje){
	var messageData = {
		recipient : {
			id: senderID
		},
		message: {
			text: mensaje
		}
	}

	callSendAPI(messageData)
}

//formatear el texto de regreso al cliente

function getMessageCLima(temperatura){
	if(temperatura > 30){
		"Hay " + temperatura + "° en Antofagasta, no salgas sin bloqueador :)"
	}else{
		"Hay "+ temperatura + "° en Antofagasta, es un lindo dia para salir ;)"
	}
}

//enviar texto en temperatura
function getClima(callback){
	request('http://api.openweathermap.org/data/2.5/weather?q=Antofagasta,cl&appid=9bdeb56a5e814840d7eaa0644a55a6c6',
		function(error, response, data){
			if(!error){
				var response = JSON.parse(data)
				var temperatura = response.main.temp - 273
				temperatura=Math.round(temperatura)
				callback(temperatura)
			}else{
				callback(15) //temperatura por defecto
			}
		})
}

function callSendAPI(messageData){
	//api de facebook
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: APP_TOKEN},
		method: 'POST',
		json: messageData
	},function(error, response, data){
		if(error)
			console.log('No es posible enviar el mensaje')
		else
			console.log('Mensaje enviado')
	})
}

function isContain(texto, word){
	if(typeof texto=='undefined' || texto.lenght<=0) return false
	return texto.indexOf(word) > -1
}