import { defineAsyncComponent } from 'vue'
import hash from 'hash-sum'
import axios from "axios";

export default function HttpVueLoader(url, basePath) {
    return defineAsyncComponent(() => {
        return new Promise((resolve, reject) => {
            // ...从服务器获取组件
            axios.get(url)
                .then(response => {
                    let id = hash('url');

                    let text = response.data;
                    if (!text.includes("<template")) {  //方式一，返回的是 json 格式： { template:xxx, data(){}, mounted(){} }
                        let com = eval(`(${text})`);
                        //console.log(com);
                        resolve(com);
                    } else {    //方式二，返回的是一个 .vue 格式 <template>xxx</template><style></style><script><\/script>
                        let style = /<style[\s\S]*?>([\s\S]+?)<\/style>/gi.exec(text);
                        let scopeStyle = false;
                        if (style) {
                            scopeStyle = /<style.*?scoped.*?>/gi.test(style[0]);
                            //console.log(scopeStyle, style[0]);
                            style = style[1];
                        }

                        let scri1 = /(<script[\s\S]*?>)/gi.exec(text);
                        let scri2 = /<\/script>/gi.exec(text);
                        let start = scri1.index + scri1[1].length;
                        let scri = text.substring(start, scri2.index);
                        scri = scri.replace(/export\s+default/gi, 'return ');
                        
                        //get import uri
                        let re = /import\s+(.*?)\s+from\s+(.*);?[\s\r\n]*/gi;
                        let mods = [];
                        let mc = re.exec(scri);
                        while (mc) {
                            let mod = {};
                            mod.names = mc[1].replace(/\{(.*)\}/gi, '$1').trim();
                            mod.src = mc[2].replace(/['"]/gi, '');
                            mods.push(mod);
                            mc = re.exec(scri);
                        }
                        scri = scri.replace(re, ''); 

                        let nss = [];   //一会儿要删掉
                        function callback(obj, ns) {
                            //console.log(`|${ns}|`, obj)
                            if (obj.default) {   //可以认为是 import xxx from xxx
                                setWindowProperty(ns, obj.default);
                            } else {    //可以认为是 import { xx1, xx2 } from xxx
                                for (let n of ns.split(/\s*,\s*/gi)) {
                                    setWindowProperty(n, obj[n]);
                                }
                            }
                            //console.log(window);
                        }

                        //这里要用到 window 级别全局变量，所以需要防止污染。
                        function setWindowProperty(name, val) {
                            if (window[name]) window[`${name}_${id}`] = window[name];
                            window[name] = val;
                            nss.push(name);
                        }
                        //既然要防止污染，那用完就赶紧删了吧。
                        function clearWindowProperty() {
                            for (let name of nss) {
                                if (window[`${name}_${id}`]) {
                                    window[name] = window[`${name}_${id}`];
                                } else delete window[name];
                            }
                        }

                        //处理一下 import
                        let cnt = 0;    //是否所有  import 都已经导入
                        for (let mod of mods) {
                            basePath = basePath ? basePath : "/src/";
                            mod.src = mod.src.replace(/^\.\//gi, basePath);
                            import(mod.src)
                                .then(obj => {
                                    callback(obj, mod.names);
                                    cnt++;
                                    if (cnt == mods.length) Init();
                                })
                                .catch(reson => {
                                    console.log(reson);
                                });
                        }

                        function Init() {
                            scri = `(function(){${scri}})()`;
                            //console.log(scri);
                            scri = eval(scri);
                            //console.log(scri);
                            scri.template = /<template>([\s\S]+)<\/template>/gi.exec(text)[1];
                            if (scopeStyle) {
                                scri.template = scri.template.replace(/<(\w+)([\s\S]*?)([/]?)>/gi, `<$1$2 data-v-${id}$3>`);
                                var newStyle = document.createElement("style");

                                style = style.replace(/(\w+)[\s\r\n]*?([,>{])/gi, `$1[data-v-${id}]$2`);

                                newStyle.innerHTML = style;
                                document.head.appendChild(newStyle);
                                //console.log(style)
                            }

                            clearWindowProperty();
                            //console.log(scri);
                            resolve(scri);
                        }
                    }
                })
            //resolve(/* 获取到的组件 */)
        })
    })
}
