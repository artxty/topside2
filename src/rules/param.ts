import { Context, Fragment, Rule } from "../CompilerInterface";
import NullFragment from "../fragments/null";
import CompileError from "../CompileError";
import { Token } from "../Token";

const SEMICOLON_RX = /;$/;

export interface TemplateParameter {
    name: string;
    type: string;
}

declare module "../CompilerInterface" {
    interface Context {
        params: TemplateParameter[]
    }
}

export const ParamRule: Rule = {
    name: "param",

    initContext(ctx: Context): void {
        ctx.params = [];
    },

    analyze(ctx: Context, t: Token): Fragment {
        const parts = t.data.split(":");
        if (parts.length === 1) {
            let errorPos = t.ch + ParamRule.name.length + 2;
            throw new CompileError(
                "Missing type annotation.",
                t.line,
                errorPos
            );
        }
        ctx.params.push({
            name: parts[0].trim(),
            type: parts[1].trim().replace(SEMICOLON_RX, "")
        });
        return new NullFragment(t);
    }
};
