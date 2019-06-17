import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [{
    input: 'src/Inspectlet.js',
    output: {
        file: 'Inspectlet.js',
        format: 'umd',
        exports: 'named',
        name: 'mp-inspectlet-kit',
        strict: false
    },
    plugins: [
        resolve({
            browser: true
        }),
        commonjs()
    ]
},
{
    input: 'src/Inspectlet.js',
    output: {
        file: 'dist/Inspectlet.js',
        format: 'umd',
        exports: 'named',
        name: 'mp-inspectlet-kit',
        strict: false
    },
    plugins: [
        resolve({
            browser: true
        }),
        commonjs()
    ]
}
] 