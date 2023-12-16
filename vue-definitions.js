// custom markdown component

Vue.component('md', {

  template: '<div ref="markdown" style="width: 100%"><slot></slot></div>',

  mounted() {
    // katex marked mashup from https://gist.github.com/tajpure/47c65cf72c44cb16f3a5df0ebc045f2f
    // slightly modified to pass displayMode variable to the katex renderer

    let inputHTML = this.$refs.markdown.innerHTML;
    let parsedHTML = this.convertHTML(inputHTML);
    this.$refs.markdown.innerHTML = marked(parsedHTML);
  },

  methods: {

    convertHTML(text) {

      const blockRegex = /\$\$[^\$]*\$\$/g
      const inlineRegex = /\$[^\$]*\$/g
      let blockExprArray = text.match(blockRegex)
      let inlineExprArray = text.match(inlineRegex)

      for (let i in blockExprArray) {
        const expr = blockExprArray[i]
        const result = this.renderMathsExpression(expr)
        text = text.replace(expr, result)
      }

      for (let i in inlineExprArray) {
        const expr = inlineExprArray[i]
        const result = this.renderMathsExpression(expr)
        text = text.replace(expr, result)
      }

      return text;
    },

    renderMathsExpression(expr) {

      if (expr[0] === '$' && expr[expr.length - 1] === '$') {
        let displayMode = false
        expr = expr.substr(1, expr.length - 2)
        if (expr[0] === '$' && expr[expr.length - 1] === '$') {
          displayMode = true
          expr = expr.substr(1, expr.length - 2)
        }
        let html = null

        try {

          // ugly hack for now
          while(expr.includes('&amp;')) {
            expr = expr.replace('&amp;', '&');
          }
          while(expr.includes('&lt;')) {
            expr = expr.replace('&lt;', '<');
          }
          while(expr.includes('&gt;')) {
            expr = expr.replace('&gt;', '>');
          }

          html = katex.renderToString(expr, {displayMode: displayMode})

        } catch (e) {

          console.log(expr);
          console.log(e);

        }

        if (displayMode && html) {
          html = html.replace(/class="katex"/g, 'class="katex katex-block" style="display: block;"')
        }
        return html
      } else {
        return null
      }
    }
  }

});


// drawing challenge component


Vue.component('challenge', {

  props: ['label', 'palette', 'image', 'instruction','worksheet', 'padlet'],

  template: `
  <div :class="['exercise-box', palette]">
    <h4>{{label}}</h4>
    <a :href="worksheet"><img :src="image" class="exercise-image shrinkToFit" width="50%"/></a>
    <a :href="padlet"><h5>{{instruction}}</h5></a>
    <br>
  </div>
  `,


  data: function() {
    return {
      selected: NaN
    }
  }

})


// multiple choice question component


Vue.component('mcq', {

  props: ['label', 'palette', 'images', 'question','choices'],

  template: `
  <div :class="['exercise-box', palette]">
    <h4>{{label}}</h4>
        <img v-for="image in images" :src="image" :class="['exercise-image', 'shrinkToFit']" width="60%"/>
    <h5>{{question}}</h5>
    <br>
    <p v-for="(choice, index) in choices" :class="(choice.correct && selected == index) ? 'bold' : ''"><input type="radio" v-model="selected" :value="index">{{choice.answer}}</p>
    <p v-for="(choice, index) in choices" v-if="index == selected" :class="choice.correct ? 'true' : 'false'">{{choice.response}}</p>
  </div>
  `,


  data: function() {
    return {
      selected: NaN
    }
  }

})


// pictorial multiple choice question component


Vue.component('mcq-pictorial', {

  props: ['label', 'palette', 'images','question', 'choices'],

  template: `
  <div :class="['exercise-box', palette]">
    <h4>{{label}}</h4>
    <img v-for="image in images" :src="image" :class="['exercise-image', 'shrinkToFit']" width="70%"/>
    <h5>{{question}}</h5>
    <br>

    <div class="flex-container">
    <figure v-for="(choice, index) in choices">
    <img :src="choice.picture" :class="['solution-image', 'shrinkToFit']" width=200px>
    <figcaption :class="['answer', (choice.correct && selected == index) ? 'bold' : '']">
    <input type="radio" v-model="selected" :value="index">{{choice.answer}}
    </figcaption>
    </figure>
    </div>    
    <p v-for="(choice, index) in choices" v-if="index == selected" :class="choice.correct ? 'true' : 'false'">{{choice.response}}</p>
  </div>
  `,


  data: function() {
    return {
      selected: NaN
    }
  }

})

// slider component
Vue.component('slider', {
  props: ['value', 'min', 'max', 'step'],

  template: `<div><input type="range" :min="min" :max="max" :step="step" :value="value" @input="sliderChanged" class="slider"></input></div>`,

  methods: {
    sliderChanged: function(event) {
      let slider = event.target;
      this.$emit('input', slider.value)
    },
  }
})

// custom p5 component

Vue.component('p5', {

  template: '<div v-observe-visibility="visibilityChanged"></div>',

  props: ['vars'],

  methods: {

    script() { // this is a javascript closure, use so we can refer to parent level variables from within the p5 code 

      let vars = this.vars;
      let code = this.$slots.default[0].text;
      let parent = this;

      return function (p) {

        if (code) {
          try {
            eval(code);
          } catch(error) {
            console.log(code);
            console.log(error);
          }
        }

      };

    },

    visibilityChanged(isVisible, entry) {
      this.isVisible = isVisible;
    }
  },

  data: function() {
    return {
      myp5: {},
      isVisible: false
    }
  },

  mounted() {
    this.myp5 = new p5(this.script(), this.$el);
  },

  watch: {
    data: {
      handler: function(val, oldVal) {
        if(this.myp5.dataChanged) {
          this.myp5.dataChanged(val, oldVal);
        }
      },
      deep: true
    }
  }
})

// load Vue
// data is defined in index.html
new Vue({el: '#root', data: data});
