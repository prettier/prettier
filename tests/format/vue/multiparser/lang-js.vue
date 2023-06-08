<script lang="js">
import data from './data'


import dayjs from 'dayjs'

export default {
name:  'MyComponent', data() {
    return {
         message:                  'Hello, Vue!',

      description: 'script lang is set to js.',
        items: [
          'Item 1', 'Item 2',
          'Item 3',             ],
      count:0,
    }
  }, methods: {
  increment(){
  this.count    ++
    },
    decrement() {this.count   --
    },
    format(date) {
 return dayjs(date).format('YYYY/MM/DD HH:mm:ss');  },
  },



  computed:{      doubleCount(){
      return this.count * 2
},
dataCount(){
      return data.length
  },
mounted() {
        console.log('Component mounted.')}
}}</script>
