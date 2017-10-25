import Ember from 'ember';
import config from '../../config/environment';

const {
  inject: { service }
} = Ember;

export default Ember.Route.extend({
  websockets: service(),

  beforeModel(){
    const socket = this.get('websockets').socketFor(config.ADDRESS+'1111/');

    socket.reconnect();

    socket.on('message', function (message) {
      message = JSON.parse(message.data);
      if (message.type==="stats") {
        const stats = [["Вариант", "Кол-во голосов"]];
        message.stats.forEach(stat => {
          stats.push([stat.text,stat.votes]);
        });
        this.set("currentModel.stats",stats);
      }
    }, this);

    this.set('socket',socket);
  },

  model(){
    return {
      stats: [["Ожидание","Ожидание"]],
      pie: true,
      options: {
        height: 900,
        width: 1800
      }
    }
  }

});
