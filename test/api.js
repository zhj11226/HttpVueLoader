(function(){
    let retTemplate = `<template><div><span>{{aaa}}</span><HelloWorld msg=""Hahahaha!"" /></div></template>
    <script>
    import HelloWorld from './components/HelloWorld.vue'
    import { add, sub } from './components/math.js'
    import _times from './components/times.js'
    
    export default {
        components: {
            HelloWorld
        },
        data() {
            return {
                aaa: 123
            }
        },
        mounted() {
            this.aaa = this._times(3,8);
        },
        methods: {
            add,sub,_times
        }
    }</script>
    <style scoped>
        div { width:100%; height:80px; color:#0f0; }
        span { color:#f00; }
        div, span { font-size:14px; }
        div>span { font-weight: bold; }
    </style>`;

    //retTemplate 这个内容是可以放在文件，代码，或者数据库里头的。
    
    return retTemplate;
})();