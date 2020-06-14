/* ====================== *
 * Utilitários do script  *
 * ====================== */
class Utils {
	getMessage(obj){
		return document.querySelector(`div[data-id="${obj.detail.messageId}"]`);
	}
	
	getBeforeElement(element){
		return element.previousElementSibling;
	}
	
	hexToHSL(hex) {
		var r, g, b;
		[r, g, b] = this.hexToRGB(hex);
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;
		if(max == min){
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		var HSL = [h*360, s*100, l*100];
		return HSL.map(k => Math.round(k));
	}
	hexToRGB(hex){
		var result, r, g, b;
		result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		r = parseInt(result[1], 16);
		g = parseInt(result[2], 16);
		b = parseInt(result[3], 16);
		return [r, g, b];
	}
	isLight(hex) {
		var r, g, b, hsp;
		[r, g, b] = this.hexToRGB(hex);
		// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
		hsp = Math.sqrt(
		0.299 * (r * r) +
		0.587 * (g * g) +
		0.114 * (b * b)
		);
		return hsp > 127.5 ? true : false;
	}
}
/* ====================== */

utils = new Utils(); /* Declaração da classe dos utilitários */

/* ============================ *
 * Funções que serão executadas	*
 * 		em cada mensagem		*
 * ============================ */
class EachMessageThings {
	constructor(obj){
		this.messageObj = obj;
	}
	
	connectMessages(){
		var message = utils.getMessage(this.messageObj);
		
		try {
			var lastName = utils.getBeforeElement(message).children[0].children[0].innerText.toLowerCase();
		} catch {
			var lastName = '';
		}
		
		if(lastName == this.messageObj.detail.from){
			message.classList.add('next');
		}
	}
	
	dynamicNickColors(){
		var userColor = this.messageObj.detail.tags.color;
		
		if(utils.isLight(userColor)){
			utils.getMessage(this.messageObj).children[0].children[0].classList.add('dark');
		}
	}
	
	optimizeChat(){
		var chatElement = document.querySelector('div[id="log"]');
		if(chatElement.childElementCount > 30){
			chatElement.removeChild(chatElement.firstElementChild)
		}
	}
}
/* ============================ */

window.addEventListener('message', event => {
  if(event.data.type == 'clear'){
    if(event.data.message.body == ''){
      document.dispatchEvent(new CustomEvent('onClearChat', {detail: event.data}));
    } else {
      document.dispatchEvent(new CustomEvent('onTimeout', {detail: event.data}));
    }
  }
})

document.addEventListener('onLoad', function(obj) {});

document.addEventListener('onEventReceived', function(obj) {
	eachMessageThings = new EachMessageThings(obj); /* Declaração da classe dos executáveis */
	
	eachMessageThings.connectMessages();
	
	eachMessageThings.dynamicNickColors();
	
	eachMessageThings.optimizeChat();
});

document.addEventListener('onClearChat', event => {
	element = document.getElementById('log');
	Array.from(element.childNodes).forEach(el => element.removeChild(el));
});

document.addEventListener('onTimeout', event => {
	console.log(event);
	timeoutedName = event.detail.message.body;
	element = document.querySelector('div[id="log"]');
	Array.from(element.childNodes).forEach(el => {
		try {
			if(el.dataset.from.toLowerCase() == timeoutedName){
				el.classList.add('deleted');
			}
		} catch {}
  });
});