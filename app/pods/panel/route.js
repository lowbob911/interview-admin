import Ember from 'ember';
import config from '../../config/environment';

const {
  inject: { service }
} = Ember;

export default Ember.Route.extend({
  websockets: service(),

  beforeModel(){
    const socket = this.get('websockets').socketFor(config.ADDRESS+'7000/');
    const asocket = this.get('websockets').socketFor(config.ADDRESS+'1111/');

    socket.reconnect();
    asocket.reconnect();

    asocket.on('message', function (message) {
      message = JSON.parse(message.data);

      if (message.type==="stats") {
        this.set("stats",message.stats);
        console.log(this.get('stats'));
      }

      if (message.type==="answer") {
        const arr = this.get('stats');
        const quest = arr.findBy("id",message.id);
        quest.votes += 1;
        console.log(arr);
      }

    }, this);

    socket.on('message', function (message) {
      message = JSON.parse(message.data);

      if (message.type==="interview") {
        this.set('currentModel.questions', message.questions);
        this.set('currentModel.count', message.questions.length);
      }

    }, this);

    this.set('asocket', socket);
    this.set('socketRef', socket);
  },

  model(){
    return {
      count: 0,
      questions: []
    }
  },

  actions: {
    setup(count){
      let qarr = [];
      for(let i=1; i<=parseInt(count); i++){
        qarr.push({
          id:i,
          text:""
        })
      }
      const stats = Ember.copy(qarr);
      stats.forEach(q => {
        q.votes=0;
      });
      this.set('stats',stats);
      this.set('currentModel.questions', qarr);
    },

    send(questions){
      let message = {
        type: "interview",
        questions: questions
      };
      this.get('socketRef').send(JSON.stringify(message));
    },

    create(){
      let message = {
        type: "stop"
      };

      this.get('socketRef').send(JSON.stringify(message));
      this.transitionTo("visualisation");
    }
  }
});
