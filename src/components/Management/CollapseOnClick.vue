<script>
  export default {
    props: ['on', 'actions'],

    render: () => null,

    created () {
      const {on, actions: {toggleExpandCollapse, setSelected}} = this;

      on('clickedNode', ({element}) => {
        toggleExpandCollapse(element);
      })
      on('clickedText', ({element, data}) => {
        console.log(data)
        setSelected(element);
      })
    }
  }
</script>