
var DictionaryModel = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
      en: 'No English',
      zh: '没有中文'
    }
  },
})

var DictionaryCollection = CollectionWS.extend({
	model: DictionaryModel,
	language: 'en',
	key: function(key){
		var model = this.get(key);

		var span = function(text, language){
			return '<span class=' + language + '>'+text+'</span>'
		}

		if(model){
			words = model.get(this.language);
			if( words == '没有中文' ){
				//this means the english and chinese words are the same
				return span(model.get('en'), 'en');
			}else{
				return span(words, this.language);
			}
		}else{
			return "*" + key + "*";
		}
	},
	currentLanguage: function(){
		return this.language;
	},
	changeLanguage: function(newLanguage){
		this.language = newLanguage;
	}
});


var data = JSON.parse( loadData("/static/dictionary.json") );

window.Dictionary = new DictionaryCollection(data);

