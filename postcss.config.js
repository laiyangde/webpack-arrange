module.exports = {
    plugins: [
        require('autoprefixer')({//参考https://github.com/postcss/autoprefixer，内联css加前缀看html-autoprefixer
        	browsers:[//浏览器兼容列表,参考Browserslist：https://github.com/ai/browserslist
        		'last 2 versions',
        		'last 30 Chrome versions',
        	],
        	env:undefined,//string 什么环境下运用Browserslist，生成还是开发？
        	cascade:true,//未压缩的css是否使用视觉级联（ Visual Cascade）
        	flexbox:true,// (boolean|string):是否应为为flexbox属性添加前缀
        	grid:false,//是否为ie的布局属性添加前缀
        })
    ]
}