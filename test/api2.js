(function(){
    let retTemplate = `{
        template: '<div style=""width:100%"">{{aaa}}</div>',
        data() {
            return {
                aaa: 123
            }
        },
        mounted() {
            this.aaa = 456;
        }
    }`

    return retTemplate;
})();