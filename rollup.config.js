import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

export default {
    input: 'src/index.js',
    output: {
        file: `dist/mrz-reader.min.js`,
        format: 'umd',
        name: 'MRZ'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        uglify()
    ]
};