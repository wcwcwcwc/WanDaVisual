import { gl } from './gl';
import { IAttribute } from './IAttribute';
import { IElements } from './IElements';
import { IUniform } from './IUniform';

export interface IBlendOptions {
  // gl.enable(gl.BLEND)
  enable: boolean;
  // gl.blendFunc
  func: BlendingFunctionSeparate;
  // gl.blendEquation
  equation: {
    rgb:
      | gl.FUNC_ADD
      | gl.FUNC_SUBTRACT
      | gl.FUNC_REVERSE_SUBTRACT
      | gl.MIN_EXT
      | gl.MAX_EXT;
    alpha?:
      | gl.FUNC_ADD
      | gl.FUNC_SUBTRACT
      | gl.FUNC_REVERSE_SUBTRACT
      | gl.MIN_EXT
      | gl.MAX_EXT;
  };
  // gl.blendColor
  color: [number, number, number, number];
}
type stencilOp =
  | gl.ZERO
  | gl.KEEP
  | gl.REPLACE
  | gl.INVERT
  | gl.INCR
  | gl.DECR
  | gl.INCR_WRAP
  | gl.DECR_WRAP;

type BlendingFunctionCombined = Partial<{
  src:
    | gl.ZERO
    | gl.ONE
    | gl.SRC_COLOR
    | gl.ONE_MINUS_SRC_COLOR
    | gl.SRC_ALPHA
    | gl.ONE_MINUS_SRC_ALPHA
    | gl.DST_COLOR
    | gl.ONE_MINUS_DST_COLOR
    | gl.DST_ALPHA
    | gl.ONE_MINUS_DST_ALPHA
    | gl.CONSTANT_COLOR
    | gl.ONE_MINUS_CONSTANT_COLOR
    | gl.CONSTANT_ALPHA
    | gl.ONE_MINUS_CONSTANT_ALPHA
    | gl.SRC_ALPHA_SATURATE;
  dst:
    | gl.ZERO
    | gl.ONE
    | gl.SRC_COLOR
    | gl.ONE_MINUS_SRC_COLOR
    | gl.SRC_ALPHA
    | gl.ONE_MINUS_SRC_ALPHA
    | gl.DST_COLOR
    | gl.ONE_MINUS_DST_COLOR
    | gl.DST_ALPHA
    | gl.ONE_MINUS_DST_ALPHA
    | gl.CONSTANT_COLOR
    | gl.ONE_MINUS_CONSTANT_COLOR
    | gl.CONSTANT_ALPHA
    | gl.ONE_MINUS_CONSTANT_ALPHA
    | gl.SRC_ALPHA_SATURATE;
}>;

type BlendingFunctionSeparate = Partial<{
  srcRGB:
    | gl.ZERO
    | gl.ONE
    | gl.SRC_COLOR
    | gl.ONE_MINUS_SRC_COLOR
    | gl.SRC_ALPHA
    | gl.ONE_MINUS_SRC_ALPHA
    | gl.DST_COLOR
    | gl.ONE_MINUS_DST_COLOR
    | gl.DST_ALPHA
    | gl.ONE_MINUS_DST_ALPHA
    | gl.CONSTANT_COLOR
    | gl.ONE_MINUS_CONSTANT_COLOR
    | gl.CONSTANT_ALPHA
    | gl.ONE_MINUS_CONSTANT_ALPHA
    | gl.SRC_ALPHA_SATURATE;
  srcAlpha: number;
  dstRGB:
    | gl.ZERO
    | gl.ONE
    | gl.SRC_COLOR
    | gl.ONE_MINUS_SRC_COLOR
    | gl.SRC_ALPHA
    | gl.ONE_MINUS_SRC_ALPHA
    | gl.DST_COLOR
    | gl.ONE_MINUS_DST_COLOR
    | gl.DST_ALPHA
    | gl.ONE_MINUS_DST_ALPHA
    | gl.CONSTANT_COLOR
    | gl.ONE_MINUS_CONSTANT_COLOR
    | gl.CONSTANT_ALPHA
    | gl.ONE_MINUS_CONSTANT_ALPHA
    | gl.SRC_ALPHA_SATURATE;
  dstAlpha: number;
}>;

export interface IModelInitializationOptions {
  /**
   * Shader ???????????????????????????????????? ShaderLib ??????
   */
  vs: string;
  fs: string;

  uniforms?: {
    [key: string]: IUniform;
  };

  attributes: {
    [key: string]: IAttribute;
  };

  /**
   * gl.POINTS | gl.TRIANGLES | ...
   * ????????? gl.TRIANGLES
   */
  primitive?:
    | gl.POINTS
    | gl.LINES
    | gl.LINE_LOOP
    | gl.LINE_STRIP
    | gl.TRIANGLES
    | gl.TRIANGLE_FAN
    | gl.TRIANGLE_STRIP;
  // ?????????????????????
  count?: number;
  // ???????????? 0
  offset?: number;

  /**
   * gl.drawElements
   */
  elements?: IElements;
  /**
   * ??????????????????
   */
  instances?: number;

  colorMask?: [boolean, boolean, boolean, boolean];

  /**
   * depth buffer
   */
  depth?: Partial<{
    // gl.enable(gl.DEPTH_TEST)
    enable: boolean;
    // gl.depthMask
    mask: boolean;
    // gl.depthFunc
    func:
      | gl.NEVER
      | gl.ALWAYS
      | gl.LESS
      | gl.LEQUAL
      | gl.GREATER
      | gl.GEQUAL
      | gl.EQUAL
      | gl.NOTEQUAL;
    // gl.depthRange
    range: [0, 1];
  }>;

  /**
   * blending
   */
  blend?: Partial<IBlendOptions>;

  /**
   * stencil
   */
  stencil?: Partial<{
    // gl.enable(gl.STENCIL_TEST)
    enable: boolean;
    // gl.stencilMask
    mask: number;
    func: {
      cmp:
        | gl.NEVER
        | gl.ALWAYS
        | gl.LESS
        | gl.LEQUAL
        | gl.GREATER
        | gl.GEQUAL
        | gl.EQUAL
        | gl.NOTEQUAL;
      ref: number;
      mask: number;
    };
    opFront: {
      fail: stencilOp;
      zfail: stencilOp;
      zpass: stencilOp;
    };
    opBack: {
      fail: stencilOp;
      zfail: stencilOp;
      zpass: stencilOp;
    };
  }>;

  /**
   * cull
   */
  cull?: {
    // gl.enable(gl.CULL_FACE)
    enable: boolean;
    // gl.cullFace
    face: gl.FRONT | gl.BACK;
  };
}

export interface IModelDrawOptions {
  uniforms?: {
    [key: string]: IUniform;
  };

  attributes?: {
    [key: string]: IAttribute;
  };
  elements?: IElements;

  blend?: IBlendOptions;
}

/**
 * ?????? THREE.Mesh???????????????????????????????????? THREE.Scene???????????????????????????????????????
 * ?????????????????????
 * * ?????? Shader Program
 * * ??????/?????? WebGL ??????(gl.enable)?????? depth/stencil buffer???blending???cull ???
 * * ????????????????????? buffer texture ???
 */
export interface IModel {
  addUniforms(uniforms: { [key: string]: IUniform }): void;
  draw(options: IModelDrawOptions): void;
  destroy(): void;
}
