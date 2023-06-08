<script>


    import axios from 'axios'

export default {
  name:    'MyComponent',
 data:() =>({
      message: 'no script lang set',count:0,items: [,,]
}),
  created      (    ) {
  axios.get('/api/items')
      .then(response=>{ this.items=     response.data;
      })

      .catch(   error =>     {
        console.error  (error)
}

)
  },

methods: {increment() {
      this.count++
    },
decrement() {  if (this.count >0) { this.count       --
      }
},
    addItem(item) {
 axios.post('/api/items',item,   )
                                .then(response=> {
          this.items.push(response.data)
        })
        .catch(error => {
  console.error(error)
        })  }
  }
}
</script>
