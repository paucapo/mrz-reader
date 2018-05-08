import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

const dev = {
    input: 'src/index.js',
    output: {
        file: 'dist/mrz-reader.js',
        format: 'umd',
        name: 'MRZ'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
};

const production = JSON.parse(JSON.stringify(dev));

production.output.file = 'dist/mrz-reader.min.js';
production.plugins = [
    babel({
        exclude: 'node_modules/**'
    }),
    uglify(),
];

export default [
    dev,
    production,
];