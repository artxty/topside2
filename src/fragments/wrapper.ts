import { Context, Fragment } from '../CompilerInterface';

export class WrapperBeforeFragment extends Fragment {

    render(ctx: Context): string {

        const paramsTypeDecl = `export type __Params = {
${ctx.params.map(p => '            ' + p.name + ': ' + p.type).join(',\n')}
} ${ctx.extends.parentTemplate ? '& __ParentParams' : ''}`;

        const argParams = `__params${ctx.params.length === 0 ? '?' : ''}: __Params`;

        const sectionsType = `{
${ctx.sections.names.map(n => `            '${n}'?: __Section;`).join('\n')}
        }`;
        const safeSectionsType = `{
${ctx.sections.names.map(n => `            '${n}': __Section;`).join('\n')}
        }`;

        const argSections = `__childSections?: ${sectionsType}`;

        const paramsDereference = ctx.params.map(p => `    const ${p.name} = __params.${p.name};`).join('\n')

        const imports = ctx.imports.map(i => {
                return 'import ' + i + ';';
            })
            .join('\n');

        // We need to use the parent's definition of a Section otherwis the typescript compiler chokes (as of tsc@2.4.1)
        const parentImport = ctx.extends.parentTemplate ?
            `import __parent, { __Params as __ParentParams } from ${ctx.extends.parentTemplate}` :
            '';

        const sectionsExpr = `
    let __safeChildSections: ${sectionsType} = __childSections || {};
    __safeChildSections;
    const __sections: ${safeSectionsType} = {
${ctx.sections.names.map(n => `        "${n}": __safeSection(__safeChildSections["${n}"])`).join(',\n')}
    };
    __sections;`;

        const sectionInterfaceDecl =
`export interface __Section {
    (parent: () => string): () => string;
}`;


        return (`
/* tslint:disable */
// This file was generated from a topside template.
// Do not edit this file, edit the original template instead.

import * as __escape from 'escape-html';
__escape;
${imports}
${parentImport}
${sectionInterfaceDecl}
${paramsTypeDecl}

function __identity<T>(t: T): T {
    return t;
}
__identity;

function __safeSection(section?: __Section): __Section {
        return section ? section : __identity;
}
__safeSection;

export default function(${argParams}, ${argSections}): string {
${paramsDereference}
${sectionsExpr}
    const __text = "`
        );
    }
}

export class WrapperAfterFragment extends Fragment {

    render(ctx: Context): string {
        ctx;
        return `";
    __text;
    return ${ctx.extends.parentTemplate ? '__parent(__params, __sections)' : '__text'};
};`;
    }
};
