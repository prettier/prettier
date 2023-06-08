<script lang="">
import HelloWorld from './HelloWorld.vue'

export default {
  data: () =>({msg: 'script lang is set to empty.'         }),
  components: { HelloWorld,
  },



  methods: {
    test() {                       return 'test';
    },
  },
  computed: {
    computedMsg() { return this.msg },
  },

}
</script>
