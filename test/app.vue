<script setup>
    import { RouterLink, RouterView } from 'vue-router'
    import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
    <header>
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

        <div class="wrapper">
            <HelloWorld msg="You did it!" />
            {{info}}
            <aa2></aa2>
            <keep-alive><component is="AsyncComp"></component></keep-alive>
            <keep-alive><component is="AsyncComp2"></component></keep-alive>
            {{info}}
            <nav>
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/about">About</RouterLink>
            </nav>
        </div>
    </header>

    <RouterView />
</template>

<script>
    import { createApp } from 'vue/dist/vue.esm-bundler.js';    //不加这个 components 会报错
    import HttpVueLoader from '../src/HttpVueLoader.js';

    export default {
        components: {
            'aa2': {
                template: '<div style="width:100%">{{aaa}}</div>',
                data: () => {
                    return { aaa: 123 }
                }
            },
            "AsyncComp": HttpVueLoader('http://localhost:5242/vuemodel/index'),
            "AsyncComp2": HttpVueLoader('http://localhost:5242/vuemodel/index2')
        },
        data() {
            return {
                "info": "====================="
            }
        },
        mounted() {
        }
    }
</script>