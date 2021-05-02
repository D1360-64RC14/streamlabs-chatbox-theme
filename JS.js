// let blackList = ['streamlabs', 'pretzelrocks', 'nightbot', 'streamelements'];

/* ====================== *
 * Utilitários do script  *
 * ====================== */
const hexToHSL = (hex) => {
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
const hexToRGB = (hex) => {
	var result, r, g, b;
	result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	r = parseInt(result[1], 16);
	g = parseInt(result[2], 16);
	b = parseInt(result[3], 16);
	return [r, g, b];
}
const isLight = (hex) =>  {
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
/* ====================== */

/* ============================ * 
 * Funções que serão executadas	* OLD CODE, IGNORE
 * 		em cada mensagem		* OLD CODE, IGNORE
 * ============================ */ 
/* class EachMessageThings {
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
	
	removeIfInBlacklist(){
		let userName = this.messageObj.detail.from;
		if(blackList.indexOf(userName) >= 0){
			let child = utils.getMessage(this.messageObj);
			let element = document.querySelector('div[id="log"]');
			element.removeChild(child);
		}
	}
} */
/* ============================ */

document.addEventListener('onLoad', function(obj) {});

/**
 * @param  {...Function} functions 
 * @returns {any}
 */
const pipe = (...functions) => functions.reduce((prev, curr) => curr(prev), undefined);

/**
 * @param {Function} func
 * @returns {(array: any[]) => void}
*/
const ForEach = func => array => array.forEach(func);

/**
 * @param {Function} func 
 * @returns {(array: any[]) => any[]}
 */
const Mapx = func => array => array.map(func);

/**
 * @param {(value: any) => boolean} func 
 * @returns {any[]}
 */
const Filter = func => array => array.filter(func);

/**
 * @param {(prev: any[], next: any) => any[]|void)} func 
 * @returns {(array: any[]) => any[]}
 */
const Reduce = func => array => array.reduce(func, []);

/**
 * @returns {HTMLElement}
*/
const GetChatElement = () => document.getElementById("log");

/** 
 * @param {HTMLElement} element
 * @returns {HTMLElement[]}
*/
const GetElementChildren = element => Array.from(element.children);

/**
 * @param {HTMLElement} element 
 * @returns {void}
 */
const RemoveElement = element => element.remove();

/**
 * @param {string} mid
 * @returns {(value: HTMLElement) => boolean}
 */
const MatchMessageID = mid => value => value.getAttribute("data-message-id") === mid;

/**
 * @param {HTMLElement} element
 * @returns {void}
 */
const AddHiddenTag = element => element.classList.add("hidden");

/**
 * @param {string} username
 * @returns {(value: HTMLElement) => boolean}
 */
const MatchUsername = username => value => value.getAttribute("data-display-name").toLowerCase() === username;

/**
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
const GetMessageElement = element => element.querySelector(".message");

/**
 * @param {string} char 
 * @returns {(text: string) => string[]}
 */
const SplitTextByChar = char => text => text.split(char);

/**
 * @param {any[] | string} some 
 * @returns {number}
 */
const Length = some => some.length;

/**
 * @param {(flow: any) => any|void} leakFn
 * @returns {(flow: any) => any}
 */
const Leak = leakFn => flow => {
  const out = leakFn(flow)
  if(out) return out;
  return flow
}

/**
 * @returns {void}
 */
const ClearFullChat = () => pipe(
  GetChatElement,        // HTMLElement
  GetElementChildren,    // HTMLElement[]
  ForEach(RemoveElement) // void
);

/** Blurs only one message
 * @param {string} messageId 
 * @returns {void}
 */
const HideMessage = messageId => pipe(
  GetChatElement,                    // HTMLElement
  GetElementChildren,                // HTMLElement[]
  Filter(MatchMessageID(messageId)), // HTMLElement[]
  Mapx(AddHiddenTag),                // HTMLElement[]
  //Mapx(GetMessageElement),           // HTMLElement[] TODO: Random Message Content
);

/** Blurs all user's message
 * @param {string} username 
 * @returns {void}
 */
const HideTimeoutedUser = username => pipe(
  GetChatElement,                  // HTMLElement
  GetElementChildren,              // HTMLElement[]
  Filter(MatchUsername(username)), // HTMLElement[]
  Mapx(AddHiddenTag),              // HTMLElement[]
  //Mapx(GetMessageElement),         // HTMLElement[] TODO: Random Message Content
);

/**
 * @param {object} payload
 * @returns {void}
 */
const CLEARCHAT = payload => {
  if(payload.tags["ban-duration"]) {
    HideTimeoutedUser(payload.crlf);
  } else { // if(!payload.tags["ban-duration"])
    ClearFullChat();
  }
}

/**
 * @param {object} payload 
 * @returns {void}
 */
const CLEARMSG = payload => {
  if(payload.tags.login) HideMessage(payload.tags["target-msg-id"]);
}

/**
 * @param {object} payload
 * @returns {void}
 */
const PRIVMSG = payload => {

}

document.addEventListener('onEventReceived', function(obj) {
  const payload = obj.detail.payload;

  switch(payload.command) {
    case "CLEARCHAT": CLEARCHAT(payload);
    case "CLEARMSG" : CLEARMSG (payload);
    case "PRIVMSG"  : PRIVMSG  (payload);
  }
});
