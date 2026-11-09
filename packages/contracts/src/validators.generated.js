var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// validators.cjs
var validateRequest = validate20;
var schema31 = { "$schema": "https://json-schema.org/draft/2020-12/schema", "$id": "urn:naucz-pilota:ai-request:v1", "title": "Naucz Pilota \u2014 POST /api/learner-turn body v1", "description": "\u017B\u0105danie aplikacji do jej w\u0142asnego backendu. Nie jest bezpo\u015Brednim wej\u015Bciem OpenAI. Cookie/token sesji wy\u0142\u0105cznie w warstwie transportu.", "type": "object", "additionalProperties": false, "properties": { "schemaVersion": { "const": "1.0.0" }, "sessionId": { "type": "string", "pattern": "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" }, "sessionRevision": { "type": "integer", "minimum": 0, "maximum": 2147483647 }, "turnId": { "type": "string", "pattern": "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" }, "missionId": { "type": "string", "enum": ["M01", "M02", "M03", "M04", "M05", "M06"] }, "sceneRole": { "type": "string", "enum": ["teach", "robot_transfer"] }, "requestedMode": { "type": "string", "enum": ["live", "demo"] }, "phase": { "type": "string", "enum": ["teach_explain", "teach_repair", "robot_propose"] }, "userMessage": { "type": "string", "maxLength": 600 }, "candidateExpression": { "type": ["string", "null"], "minLength": 1, "maxLength": 120 }, "attemptHistory": { "type": "array", "maxItems": 6, "items": { "type": "object", "additionalProperties": false, "properties": { "attemptId": { "type": "string", "pattern": "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" }, "sceneId": { "type": "string", "pattern": "^M0[1-6]-(teach|robot_transfer)$" }, "expression": { "type": "string", "minLength": 1, "maxLength": 120 } }, "required": ["attemptId", "sceneId", "expression"] } }, "learnedRuleIds": { "type": "array", "maxItems": 6, "uniqueItems": true, "items": { "type": "string", "enum": ["RULE_LINE_INTERCEPT", "RULE_LINE_SLOPE", "RULE_QUAD_VERTICAL", "RULE_QUAD_HORIZONTAL", "RULE_QUAD_CURVATURE", "RULE_COMBINE"] } }, "numericEvidence": { "type": "array", "maxItems": 2, "items": { "type": "object", "additionalProperties": false, "properties": { "checkpointId": { "type": "string", "enum": ["G1", "G2"] }, "submittedY": { "type": "number", "minimum": -1e8, "maximum": 1e8 }, "sceneId": { "type": "string", "pattern": "^M0[1-6]-teach$" } }, "required": ["sceneId", "checkpointId", "submittedY"] } }, "ruleEvidence": { "type": "array", "maxItems": 6, "items": { "type": "object", "additionalProperties": false, "properties": { "missionId": { "type": "string", "enum": ["M01", "M02", "M03", "M04", "M05", "M06"] }, "candidateExpression": { "type": "string", "minLength": 1, "maxLength": 120 }, "lessonNote": { "type": "object", "additionalProperties": false, "properties": { "version": { "const": 1 }, "ruleId": { "type": "string", "pattern": "^RULE_[A-Z_]+$", "maxLength": 40 }, "explanationPL": { "type": "string", "minLength": 1, "maxLength": 600 }, "pikoParaphrasePL": { "type": ["string", "null"], "minLength": 1, "maxLength": 450 }, "source": { "enum": ["live", "demo", "skipped"] }, "confirmation": { "const": "saved_by_player" } }, "required": ["version", "ruleId", "explanationPL", "pikoParaphrasePL", "source", "confirmation"], "if": { "properties": { "source": { "const": "skipped" } } }, "then": { "properties": { "pikoParaphrasePL": { "type": "null" } } }, "else": { "properties": { "pikoParaphrasePL": { "type": "string" } } } }, "numericEvidence": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": "object", "additionalProperties": false, "properties": { "checkpointId": { "type": "string", "enum": ["G1", "G2"] }, "submittedY": { "type": "number", "minimum": -1e8, "maximum": 1e8 }, "sceneId": { "type": "string", "pattern": "^M0[1-6]-teach$" } }, "required": ["sceneId", "checkpointId", "submittedY"] } } }, "required": ["missionId", "candidateExpression", "numericEvidence"] } } }, "required": ["schemaVersion", "sessionId", "sessionRevision", "turnId", "missionId", "sceneRole", "requestedMode", "phase", "userMessage", "candidateExpression", "attemptHistory", "learnedRuleIds", "numericEvidence", "ruleEvidence"], "allOf": [{ "if": { "properties": { "sceneRole": { "const": "teach" } } }, "then": { "properties": { "phase": { "enum": ["teach_explain", "teach_repair"] } } } }, { "if": { "properties": { "sceneRole": { "const": "robot_transfer" } } }, "then": { "properties": { "phase": { "const": "robot_propose" }, "candidateExpression": { "type": "null" }, "numericEvidence": { "maxItems": 0 }, "userMessage": { "maxLength": 0 } } } }, { "if": { "properties": { "phase": { "const": "teach_repair" } } }, "then": { "properties": { "candidateExpression": { "type": "string", "minLength": 1, "maxLength": 120 }, "numericEvidence": { "minItems": 2, "maxItems": 2 } } } }, { "if": { "properties": { "phase": { "const": "teach_explain" } } }, "then": { "properties": { "userMessage": { "minLength": 1 }, "numericEvidence": { "maxItems": 0 } } } }] };
var func1 = require_ucs2length().default;
var func5 = Object.prototype.hasOwnProperty;
var pattern4 = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", "u");
var pattern7 = new RegExp("^M0[1-6]-(teach|robot_transfer)$", "u");
var pattern8 = new RegExp("^M0[1-6]-teach$", "u");
var pattern9 = new RegExp("^RULE_[A-Z_]+$", "u");
function validate20(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs2 = errors;
  let valid1 = true;
  const _errs3 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.sceneRole !== void 0) {
      if ("teach" !== data.sceneRole) {
        const err0 = {};
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
  }
  var _valid0 = _errs3 === errors;
  errors = _errs2;
  if (vErrors !== null) {
    if (_errs2) {
      vErrors.length = _errs2;
    } else {
      vErrors = null;
    }
  }
  if (_valid0) {
    const _errs5 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.phase !== void 0) {
        let data1 = data.phase;
        if (!(data1 === "teach_explain" || data1 === "teach_repair")) {
          const err1 = { instancePath: instancePath + "/phase", schemaPath: "#/allOf/0/then/properties/phase/enum", keyword: "enum", params: { allowedValues: schema31.allOf[0].then.properties.phase.enum }, message: "must be equal to one of the allowed values" };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      }
    }
    var _valid0 = _errs5 === errors;
    valid1 = _valid0;
    if (valid1) {
      var props0 = {};
      props0.phase = true;
      props0.sceneRole = true;
    }
  }
  if (!valid1) {
    const err2 = { instancePath, schemaPath: "#/allOf/0/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema' };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  const _errs8 = errors;
  let valid4 = true;
  const _errs9 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.sceneRole !== void 0) {
      if ("robot_transfer" !== data.sceneRole) {
        const err3 = {};
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
  }
  var _valid1 = _errs9 === errors;
  errors = _errs8;
  if (vErrors !== null) {
    if (_errs8) {
      vErrors.length = _errs8;
    } else {
      vErrors = null;
    }
  }
  if (_valid1) {
    const _errs11 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.phase !== void 0) {
        if ("robot_propose" !== data.phase) {
          const err4 = { instancePath: instancePath + "/phase", schemaPath: "#/allOf/1/then/properties/phase/const", keyword: "const", params: { allowedValue: "robot_propose" }, message: "must be equal to constant" };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      }
      if (data.candidateExpression !== void 0) {
        if (data.candidateExpression !== null) {
          const err5 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/allOf/1/then/properties/candidateExpression/type", keyword: "type", params: { type: "null" }, message: "must be null" };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      }
      if (data.numericEvidence !== void 0) {
        let data5 = data.numericEvidence;
        if (Array.isArray(data5)) {
          if (data5.length > 0) {
            const err6 = { instancePath: instancePath + "/numericEvidence", schemaPath: "#/allOf/1/then/properties/numericEvidence/maxItems", keyword: "maxItems", params: { limit: 0 }, message: "must NOT have more than 0 items" };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      }
      if (data.userMessage !== void 0) {
        let data6 = data.userMessage;
        if (typeof data6 === "string") {
          if (func1(data6) > 0) {
            const err7 = { instancePath: instancePath + "/userMessage", schemaPath: "#/allOf/1/then/properties/userMessage/maxLength", keyword: "maxLength", params: { limit: 0 }, message: "must NOT have more than 0 characters" };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
      }
    }
    var _valid1 = _errs11 === errors;
    valid4 = _valid1;
    if (valid4) {
      var props1 = {};
      props1.phase = true;
      props1.candidateExpression = true;
      props1.numericEvidence = true;
      props1.userMessage = true;
      props1.sceneRole = true;
    }
  }
  if (!valid4) {
    const err8 = { instancePath, schemaPath: "#/allOf/1/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema' };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  if (props0 !== true && props1 !== void 0) {
    if (props1 === true) {
      props0 = true;
    } else {
      props0 = props0 || {};
      Object.assign(props0, props1);
    }
  }
  const _errs18 = errors;
  let valid7 = true;
  const _errs19 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.phase !== void 0) {
      if ("teach_repair" !== data.phase) {
        const err9 = {};
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
  }
  var _valid2 = _errs19 === errors;
  errors = _errs18;
  if (vErrors !== null) {
    if (_errs18) {
      vErrors.length = _errs18;
    } else {
      vErrors = null;
    }
  }
  if (_valid2) {
    const _errs21 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.candidateExpression !== void 0) {
        let data8 = data.candidateExpression;
        if (typeof data8 === "string") {
          if (func1(data8) > 120) {
            const err10 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/allOf/2/then/properties/candidateExpression/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
          if (func1(data8) < 1) {
            const err11 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/allOf/2/then/properties/candidateExpression/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        } else {
          const err12 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/allOf/2/then/properties/candidateExpression/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
      }
      if (data.numericEvidence !== void 0) {
        let data9 = data.numericEvidence;
        if (Array.isArray(data9)) {
          if (data9.length > 2) {
            const err13 = { instancePath: instancePath + "/numericEvidence", schemaPath: "#/allOf/2/then/properties/numericEvidence/maxItems", keyword: "maxItems", params: { limit: 2 }, message: "must NOT have more than 2 items" };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
          if (data9.length < 2) {
            const err14 = { instancePath: instancePath + "/numericEvidence", schemaPath: "#/allOf/2/then/properties/numericEvidence/minItems", keyword: "minItems", params: { limit: 2 }, message: "must NOT have fewer than 2 items" };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
      }
    }
    var _valid2 = _errs21 === errors;
    valid7 = _valid2;
    if (valid7) {
      var props2 = {};
      props2.candidateExpression = true;
      props2.numericEvidence = true;
      props2.phase = true;
    }
  }
  if (!valid7) {
    const err15 = { instancePath, schemaPath: "#/allOf/2/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema' };
    if (vErrors === null) {
      vErrors = [err15];
    } else {
      vErrors.push(err15);
    }
    errors++;
  }
  if (props0 !== true && props2 !== void 0) {
    if (props2 === true) {
      props0 = true;
    } else {
      props0 = props0 || {};
      Object.assign(props0, props2);
    }
  }
  const _errs26 = errors;
  let valid10 = true;
  const _errs27 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.phase !== void 0) {
      if ("teach_explain" !== data.phase) {
        const err16 = {};
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
  }
  var _valid3 = _errs27 === errors;
  errors = _errs26;
  if (vErrors !== null) {
    if (_errs26) {
      vErrors.length = _errs26;
    } else {
      vErrors = null;
    }
  }
  if (_valid3) {
    const _errs29 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.userMessage !== void 0) {
        let data11 = data.userMessage;
        if (typeof data11 === "string") {
          if (func1(data11) < 1) {
            const err17 = { instancePath: instancePath + "/userMessage", schemaPath: "#/allOf/3/then/properties/userMessage/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
        }
      }
      if (data.numericEvidence !== void 0) {
        let data12 = data.numericEvidence;
        if (Array.isArray(data12)) {
          if (data12.length > 0) {
            const err18 = { instancePath: instancePath + "/numericEvidence", schemaPath: "#/allOf/3/then/properties/numericEvidence/maxItems", keyword: "maxItems", params: { limit: 0 }, message: "must NOT have more than 0 items" };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
      }
    }
    var _valid3 = _errs29 === errors;
    valid10 = _valid3;
    if (valid10) {
      var props3 = {};
      props3.userMessage = true;
      props3.numericEvidence = true;
      props3.phase = true;
    }
  }
  if (!valid10) {
    const err19 = { instancePath, schemaPath: "#/allOf/3/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema' };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  if (props0 !== true && props3 !== void 0) {
    if (props3 === true) {
      props0 = true;
    } else {
      props0 = props0 || {};
      Object.assign(props0, props3);
    }
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.schemaVersion === void 0) {
      const err20 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "schemaVersion" }, message: "must have required property 'schemaVersion'" };
      if (vErrors === null) {
        vErrors = [err20];
      } else {
        vErrors.push(err20);
      }
      errors++;
    }
    if (data.sessionId === void 0) {
      const err21 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      if (vErrors === null) {
        vErrors = [err21];
      } else {
        vErrors.push(err21);
      }
      errors++;
    }
    if (data.sessionRevision === void 0) {
      const err22 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionRevision" }, message: "must have required property 'sessionRevision'" };
      if (vErrors === null) {
        vErrors = [err22];
      } else {
        vErrors.push(err22);
      }
      errors++;
    }
    if (data.turnId === void 0) {
      const err23 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "turnId" }, message: "must have required property 'turnId'" };
      if (vErrors === null) {
        vErrors = [err23];
      } else {
        vErrors.push(err23);
      }
      errors++;
    }
    if (data.missionId === void 0) {
      const err24 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "missionId" }, message: "must have required property 'missionId'" };
      if (vErrors === null) {
        vErrors = [err24];
      } else {
        vErrors.push(err24);
      }
      errors++;
    }
    if (data.sceneRole === void 0) {
      const err25 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sceneRole" }, message: "must have required property 'sceneRole'" };
      if (vErrors === null) {
        vErrors = [err25];
      } else {
        vErrors.push(err25);
      }
      errors++;
    }
    if (data.requestedMode === void 0) {
      const err26 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestedMode" }, message: "must have required property 'requestedMode'" };
      if (vErrors === null) {
        vErrors = [err26];
      } else {
        vErrors.push(err26);
      }
      errors++;
    }
    if (data.phase === void 0) {
      const err27 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "phase" }, message: "must have required property 'phase'" };
      if (vErrors === null) {
        vErrors = [err27];
      } else {
        vErrors.push(err27);
      }
      errors++;
    }
    if (data.userMessage === void 0) {
      const err28 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "userMessage" }, message: "must have required property 'userMessage'" };
      if (vErrors === null) {
        vErrors = [err28];
      } else {
        vErrors.push(err28);
      }
      errors++;
    }
    if (data.candidateExpression === void 0) {
      const err29 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "candidateExpression" }, message: "must have required property 'candidateExpression'" };
      if (vErrors === null) {
        vErrors = [err29];
      } else {
        vErrors.push(err29);
      }
      errors++;
    }
    if (data.attemptHistory === void 0) {
      const err30 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "attemptHistory" }, message: "must have required property 'attemptHistory'" };
      if (vErrors === null) {
        vErrors = [err30];
      } else {
        vErrors.push(err30);
      }
      errors++;
    }
    if (data.learnedRuleIds === void 0) {
      const err31 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "learnedRuleIds" }, message: "must have required property 'learnedRuleIds'" };
      if (vErrors === null) {
        vErrors = [err31];
      } else {
        vErrors.push(err31);
      }
      errors++;
    }
    if (data.numericEvidence === void 0) {
      const err32 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "numericEvidence" }, message: "must have required property 'numericEvidence'" };
      if (vErrors === null) {
        vErrors = [err32];
      } else {
        vErrors.push(err32);
      }
      errors++;
    }
    if (data.ruleEvidence === void 0) {
      const err33 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ruleEvidence" }, message: "must have required property 'ruleEvidence'" };
      if (vErrors === null) {
        vErrors = [err33];
      } else {
        vErrors.push(err33);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!func5.call(schema31.properties, key0)) {
        const err34 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
    }
    if (data.schemaVersion !== void 0) {
      if ("1.0.0" !== data.schemaVersion) {
        const err35 = { instancePath: instancePath + "/schemaVersion", schemaPath: "#/properties/schemaVersion/const", keyword: "const", params: { allowedValue: "1.0.0" }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err35];
        } else {
          vErrors.push(err35);
        }
        errors++;
      }
    }
    if (data.sessionId !== void 0) {
      let data14 = data.sessionId;
      if (typeof data14 === "string") {
        if (!pattern4.test(data14)) {
          const err36 = { instancePath: instancePath + "/sessionId", schemaPath: "#/properties/sessionId/pattern", keyword: "pattern", params: { pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" }, message: 'must match pattern "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"' };
          if (vErrors === null) {
            vErrors = [err36];
          } else {
            vErrors.push(err36);
          }
          errors++;
        }
      } else {
        const err37 = { instancePath: instancePath + "/sessionId", schemaPath: "#/properties/sessionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err37];
        } else {
          vErrors.push(err37);
        }
        errors++;
      }
    }
    if (data.sessionRevision !== void 0) {
      let data15 = data.sessionRevision;
      if (!(typeof data15 == "number" && (!(data15 % 1) && !isNaN(data15)))) {
        const err38 = { instancePath: instancePath + "/sessionRevision", schemaPath: "#/properties/sessionRevision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err38];
        } else {
          vErrors.push(err38);
        }
        errors++;
      }
      if (typeof data15 == "number") {
        if (data15 > 2147483647 || isNaN(data15)) {
          const err39 = { instancePath: instancePath + "/sessionRevision", schemaPath: "#/properties/sessionRevision/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2147483647 }, message: "must be <= 2147483647" };
          if (vErrors === null) {
            vErrors = [err39];
          } else {
            vErrors.push(err39);
          }
          errors++;
        }
        if (data15 < 0 || isNaN(data15)) {
          const err40 = { instancePath: instancePath + "/sessionRevision", schemaPath: "#/properties/sessionRevision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          if (vErrors === null) {
            vErrors = [err40];
          } else {
            vErrors.push(err40);
          }
          errors++;
        }
      }
    }
    if (data.turnId !== void 0) {
      let data16 = data.turnId;
      if (typeof data16 === "string") {
        if (!pattern4.test(data16)) {
          const err41 = { instancePath: instancePath + "/turnId", schemaPath: "#/properties/turnId/pattern", keyword: "pattern", params: { pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" }, message: 'must match pattern "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"' };
          if (vErrors === null) {
            vErrors = [err41];
          } else {
            vErrors.push(err41);
          }
          errors++;
        }
      } else {
        const err42 = { instancePath: instancePath + "/turnId", schemaPath: "#/properties/turnId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err42];
        } else {
          vErrors.push(err42);
        }
        errors++;
      }
    }
    if (data.missionId !== void 0) {
      let data17 = data.missionId;
      if (typeof data17 !== "string") {
        const err43 = { instancePath: instancePath + "/missionId", schemaPath: "#/properties/missionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err43];
        } else {
          vErrors.push(err43);
        }
        errors++;
      }
      if (!(data17 === "M01" || data17 === "M02" || data17 === "M03" || data17 === "M04" || data17 === "M05" || data17 === "M06")) {
        const err44 = { instancePath: instancePath + "/missionId", schemaPath: "#/properties/missionId/enum", keyword: "enum", params: { allowedValues: schema31.properties.missionId.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err44];
        } else {
          vErrors.push(err44);
        }
        errors++;
      }
    }
    if (data.sceneRole !== void 0) {
      let data18 = data.sceneRole;
      if (typeof data18 !== "string") {
        const err45 = { instancePath: instancePath + "/sceneRole", schemaPath: "#/properties/sceneRole/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err45];
        } else {
          vErrors.push(err45);
        }
        errors++;
      }
      if (!(data18 === "teach" || data18 === "robot_transfer")) {
        const err46 = { instancePath: instancePath + "/sceneRole", schemaPath: "#/properties/sceneRole/enum", keyword: "enum", params: { allowedValues: schema31.properties.sceneRole.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err46];
        } else {
          vErrors.push(err46);
        }
        errors++;
      }
    }
    if (data.requestedMode !== void 0) {
      let data19 = data.requestedMode;
      if (typeof data19 !== "string") {
        const err47 = { instancePath: instancePath + "/requestedMode", schemaPath: "#/properties/requestedMode/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err47];
        } else {
          vErrors.push(err47);
        }
        errors++;
      }
      if (!(data19 === "live" || data19 === "demo")) {
        const err48 = { instancePath: instancePath + "/requestedMode", schemaPath: "#/properties/requestedMode/enum", keyword: "enum", params: { allowedValues: schema31.properties.requestedMode.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err48];
        } else {
          vErrors.push(err48);
        }
        errors++;
      }
    }
    if (data.phase !== void 0) {
      let data20 = data.phase;
      if (typeof data20 !== "string") {
        const err49 = { instancePath: instancePath + "/phase", schemaPath: "#/properties/phase/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err49];
        } else {
          vErrors.push(err49);
        }
        errors++;
      }
      if (!(data20 === "teach_explain" || data20 === "teach_repair" || data20 === "robot_propose")) {
        const err50 = { instancePath: instancePath + "/phase", schemaPath: "#/properties/phase/enum", keyword: "enum", params: { allowedValues: schema31.properties.phase.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err50];
        } else {
          vErrors.push(err50);
        }
        errors++;
      }
    }
    if (data.userMessage !== void 0) {
      let data21 = data.userMessage;
      if (typeof data21 === "string") {
        if (func1(data21) > 600) {
          const err51 = { instancePath: instancePath + "/userMessage", schemaPath: "#/properties/userMessage/maxLength", keyword: "maxLength", params: { limit: 600 }, message: "must NOT have more than 600 characters" };
          if (vErrors === null) {
            vErrors = [err51];
          } else {
            vErrors.push(err51);
          }
          errors++;
        }
      } else {
        const err52 = { instancePath: instancePath + "/userMessage", schemaPath: "#/properties/userMessage/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err52];
        } else {
          vErrors.push(err52);
        }
        errors++;
      }
    }
    if (data.candidateExpression !== void 0) {
      let data22 = data.candidateExpression;
      if (typeof data22 !== "string" && data22 !== null) {
        const err53 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/properties/candidateExpression/type", keyword: "type", params: { type: schema31.properties.candidateExpression.type }, message: "must be string,null" };
        if (vErrors === null) {
          vErrors = [err53];
        } else {
          vErrors.push(err53);
        }
        errors++;
      }
      if (typeof data22 === "string") {
        if (func1(data22) > 120) {
          const err54 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/properties/candidateExpression/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err54];
          } else {
            vErrors.push(err54);
          }
          errors++;
        }
        if (func1(data22) < 1) {
          const err55 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/properties/candidateExpression/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err55];
          } else {
            vErrors.push(err55);
          }
          errors++;
        }
      }
    }
    if (data.attemptHistory !== void 0) {
      let data23 = data.attemptHistory;
      if (Array.isArray(data23)) {
        if (data23.length > 6) {
          const err56 = { instancePath: instancePath + "/attemptHistory", schemaPath: "#/properties/attemptHistory/maxItems", keyword: "maxItems", params: { limit: 6 }, message: "must NOT have more than 6 items" };
          if (vErrors === null) {
            vErrors = [err56];
          } else {
            vErrors.push(err56);
          }
          errors++;
        }
        const len0 = data23.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data24 = data23[i0];
          if (data24 && typeof data24 == "object" && !Array.isArray(data24)) {
            if (data24.attemptId === void 0) {
              const err57 = { instancePath: instancePath + "/attemptHistory/" + i0, schemaPath: "#/properties/attemptHistory/items/required", keyword: "required", params: { missingProperty: "attemptId" }, message: "must have required property 'attemptId'" };
              if (vErrors === null) {
                vErrors = [err57];
              } else {
                vErrors.push(err57);
              }
              errors++;
            }
            if (data24.sceneId === void 0) {
              const err58 = { instancePath: instancePath + "/attemptHistory/" + i0, schemaPath: "#/properties/attemptHistory/items/required", keyword: "required", params: { missingProperty: "sceneId" }, message: "must have required property 'sceneId'" };
              if (vErrors === null) {
                vErrors = [err58];
              } else {
                vErrors.push(err58);
              }
              errors++;
            }
            if (data24.expression === void 0) {
              const err59 = { instancePath: instancePath + "/attemptHistory/" + i0, schemaPath: "#/properties/attemptHistory/items/required", keyword: "required", params: { missingProperty: "expression" }, message: "must have required property 'expression'" };
              if (vErrors === null) {
                vErrors = [err59];
              } else {
                vErrors.push(err59);
              }
              errors++;
            }
            for (const key1 in data24) {
              if (!(key1 === "attemptId" || key1 === "sceneId" || key1 === "expression")) {
                const err60 = { instancePath: instancePath + "/attemptHistory/" + i0, schemaPath: "#/properties/attemptHistory/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err60];
                } else {
                  vErrors.push(err60);
                }
                errors++;
              }
            }
            if (data24.attemptId !== void 0) {
              let data25 = data24.attemptId;
              if (typeof data25 === "string") {
                if (!pattern4.test(data25)) {
                  const err61 = { instancePath: instancePath + "/attemptHistory/" + i0 + "/attemptId", schemaPath: "#/properties/attemptHistory/items/properties/attemptId/pattern", keyword: "pattern", params: { pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" }, message: 'must match pattern "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"' };
                  if (vErrors === null) {
                    vErrors = [err61];
                  } else {
                    vErrors.push(err61);
                  }
                  errors++;
                }
              } else {
                const err62 = { instancePath: instancePath + "/attemptHistory/" + i0 + "/attemptId", schemaPath: "#/properties/attemptHistory/items/properties/attemptId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err62];
                } else {
                  vErrors.push(err62);
                }
                errors++;
              }
            }
            if (data24.sceneId !== void 0) {
              let data26 = data24.sceneId;
              if (typeof data26 === "string") {
                if (!pattern7.test(data26)) {
                  const err63 = { instancePath: instancePath + "/attemptHistory/" + i0 + "/sceneId", schemaPath: "#/properties/attemptHistory/items/properties/sceneId/pattern", keyword: "pattern", params: { pattern: "^M0[1-6]-(teach|robot_transfer)$" }, message: 'must match pattern "^M0[1-6]-(teach|robot_transfer)$"' };
                  if (vErrors === null) {
                    vErrors = [err63];
                  } else {
                    vErrors.push(err63);
                  }
                  errors++;
                }
              } else {
                const err64 = { instancePath: instancePath + "/attemptHistory/" + i0 + "/sceneId", schemaPath: "#/properties/attemptHistory/items/properties/sceneId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err64];
                } else {
                  vErrors.push(err64);
                }
                errors++;
              }
            }
            if (data24.expression !== void 0) {
              let data27 = data24.expression;
              if (typeof data27 === "string") {
                if (func1(data27) > 120) {
                  const err65 = { instancePath: instancePath + "/attemptHistory/" + i0 + "/expression", schemaPath: "#/properties/attemptHistory/items/properties/expression/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
                  if (vErrors === null) {
                    vErrors = [err65];
                  } else {
                    vErrors.push(err65);
                  }
                  errors++;
                }
                if (func1(data27) < 1) {
                  const err66 = { instancePath: instancePath + "/attemptHistory/" + i0 + "/expression", schemaPath: "#/properties/attemptHistory/items/properties/expression/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  if (vErrors === null) {
                    vErrors = [err66];
                  } else {
                    vErrors.push(err66);
                  }
                  errors++;
                }
              } else {
                const err67 = { instancePath: instancePath + "/attemptHistory/" + i0 + "/expression", schemaPath: "#/properties/attemptHistory/items/properties/expression/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err67];
                } else {
                  vErrors.push(err67);
                }
                errors++;
              }
            }
          } else {
            const err68 = { instancePath: instancePath + "/attemptHistory/" + i0, schemaPath: "#/properties/attemptHistory/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err68];
            } else {
              vErrors.push(err68);
            }
            errors++;
          }
        }
      } else {
        const err69 = { instancePath: instancePath + "/attemptHistory", schemaPath: "#/properties/attemptHistory/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err69];
        } else {
          vErrors.push(err69);
        }
        errors++;
      }
    }
    if (data.learnedRuleIds !== void 0) {
      let data28 = data.learnedRuleIds;
      if (Array.isArray(data28)) {
        if (data28.length > 6) {
          const err70 = { instancePath: instancePath + "/learnedRuleIds", schemaPath: "#/properties/learnedRuleIds/maxItems", keyword: "maxItems", params: { limit: 6 }, message: "must NOT have more than 6 items" };
          if (vErrors === null) {
            vErrors = [err70];
          } else {
            vErrors.push(err70);
          }
          errors++;
        }
        const len1 = data28.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data29 = data28[i1];
          if (typeof data29 !== "string") {
            const err71 = { instancePath: instancePath + "/learnedRuleIds/" + i1, schemaPath: "#/properties/learnedRuleIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err71];
            } else {
              vErrors.push(err71);
            }
            errors++;
          }
          if (!(data29 === "RULE_LINE_INTERCEPT" || data29 === "RULE_LINE_SLOPE" || data29 === "RULE_QUAD_VERTICAL" || data29 === "RULE_QUAD_HORIZONTAL" || data29 === "RULE_QUAD_CURVATURE" || data29 === "RULE_COMBINE")) {
            const err72 = { instancePath: instancePath + "/learnedRuleIds/" + i1, schemaPath: "#/properties/learnedRuleIds/items/enum", keyword: "enum", params: { allowedValues: schema31.properties.learnedRuleIds.items.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err72];
            } else {
              vErrors.push(err72);
            }
            errors++;
          }
        }
        let i2 = data28.length;
        let j0;
        if (i2 > 1) {
          const indices0 = {};
          for (; i2--; ) {
            let item0 = data28[i2];
            if (typeof item0 !== "string") {
              continue;
            }
            if (typeof indices0[item0] == "number") {
              j0 = indices0[item0];
              const err73 = { instancePath: instancePath + "/learnedRuleIds", schemaPath: "#/properties/learnedRuleIds/uniqueItems", keyword: "uniqueItems", params: { i: i2, j: j0 }, message: "must NOT have duplicate items (items ## " + j0 + " and " + i2 + " are identical)" };
              if (vErrors === null) {
                vErrors = [err73];
              } else {
                vErrors.push(err73);
              }
              errors++;
              break;
            }
            indices0[item0] = i2;
          }
        }
      } else {
        const err74 = { instancePath: instancePath + "/learnedRuleIds", schemaPath: "#/properties/learnedRuleIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err74];
        } else {
          vErrors.push(err74);
        }
        errors++;
      }
    }
    if (data.numericEvidence !== void 0) {
      let data30 = data.numericEvidence;
      if (Array.isArray(data30)) {
        if (data30.length > 2) {
          const err75 = { instancePath: instancePath + "/numericEvidence", schemaPath: "#/properties/numericEvidence/maxItems", keyword: "maxItems", params: { limit: 2 }, message: "must NOT have more than 2 items" };
          if (vErrors === null) {
            vErrors = [err75];
          } else {
            vErrors.push(err75);
          }
          errors++;
        }
        const len2 = data30.length;
        for (let i3 = 0; i3 < len2; i3++) {
          let data31 = data30[i3];
          if (data31 && typeof data31 == "object" && !Array.isArray(data31)) {
            if (data31.sceneId === void 0) {
              const err76 = { instancePath: instancePath + "/numericEvidence/" + i3, schemaPath: "#/properties/numericEvidence/items/required", keyword: "required", params: { missingProperty: "sceneId" }, message: "must have required property 'sceneId'" };
              if (vErrors === null) {
                vErrors = [err76];
              } else {
                vErrors.push(err76);
              }
              errors++;
            }
            if (data31.checkpointId === void 0) {
              const err77 = { instancePath: instancePath + "/numericEvidence/" + i3, schemaPath: "#/properties/numericEvidence/items/required", keyword: "required", params: { missingProperty: "checkpointId" }, message: "must have required property 'checkpointId'" };
              if (vErrors === null) {
                vErrors = [err77];
              } else {
                vErrors.push(err77);
              }
              errors++;
            }
            if (data31.submittedY === void 0) {
              const err78 = { instancePath: instancePath + "/numericEvidence/" + i3, schemaPath: "#/properties/numericEvidence/items/required", keyword: "required", params: { missingProperty: "submittedY" }, message: "must have required property 'submittedY'" };
              if (vErrors === null) {
                vErrors = [err78];
              } else {
                vErrors.push(err78);
              }
              errors++;
            }
            for (const key2 in data31) {
              if (!(key2 === "checkpointId" || key2 === "submittedY" || key2 === "sceneId")) {
                const err79 = { instancePath: instancePath + "/numericEvidence/" + i3, schemaPath: "#/properties/numericEvidence/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err79];
                } else {
                  vErrors.push(err79);
                }
                errors++;
              }
            }
            if (data31.checkpointId !== void 0) {
              let data32 = data31.checkpointId;
              if (typeof data32 !== "string") {
                const err80 = { instancePath: instancePath + "/numericEvidence/" + i3 + "/checkpointId", schemaPath: "#/properties/numericEvidence/items/properties/checkpointId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err80];
                } else {
                  vErrors.push(err80);
                }
                errors++;
              }
              if (!(data32 === "G1" || data32 === "G2")) {
                const err81 = { instancePath: instancePath + "/numericEvidence/" + i3 + "/checkpointId", schemaPath: "#/properties/numericEvidence/items/properties/checkpointId/enum", keyword: "enum", params: { allowedValues: schema31.properties.numericEvidence.items.properties.checkpointId.enum }, message: "must be equal to one of the allowed values" };
                if (vErrors === null) {
                  vErrors = [err81];
                } else {
                  vErrors.push(err81);
                }
                errors++;
              }
            }
            if (data31.submittedY !== void 0) {
              let data33 = data31.submittedY;
              if (typeof data33 == "number") {
                if (data33 > 1e8 || isNaN(data33)) {
                  const err82 = { instancePath: instancePath + "/numericEvidence/" + i3 + "/submittedY", schemaPath: "#/properties/numericEvidence/items/properties/submittedY/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e8 }, message: "must be <= 100000000" };
                  if (vErrors === null) {
                    vErrors = [err82];
                  } else {
                    vErrors.push(err82);
                  }
                  errors++;
                }
                if (data33 < -1e8 || isNaN(data33)) {
                  const err83 = { instancePath: instancePath + "/numericEvidence/" + i3 + "/submittedY", schemaPath: "#/properties/numericEvidence/items/properties/submittedY/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e8 }, message: "must be >= -100000000" };
                  if (vErrors === null) {
                    vErrors = [err83];
                  } else {
                    vErrors.push(err83);
                  }
                  errors++;
                }
              } else {
                const err84 = { instancePath: instancePath + "/numericEvidence/" + i3 + "/submittedY", schemaPath: "#/properties/numericEvidence/items/properties/submittedY/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err84];
                } else {
                  vErrors.push(err84);
                }
                errors++;
              }
            }
            if (data31.sceneId !== void 0) {
              let data34 = data31.sceneId;
              if (typeof data34 === "string") {
                if (!pattern8.test(data34)) {
                  const err85 = { instancePath: instancePath + "/numericEvidence/" + i3 + "/sceneId", schemaPath: "#/properties/numericEvidence/items/properties/sceneId/pattern", keyword: "pattern", params: { pattern: "^M0[1-6]-teach$" }, message: 'must match pattern "^M0[1-6]-teach$"' };
                  if (vErrors === null) {
                    vErrors = [err85];
                  } else {
                    vErrors.push(err85);
                  }
                  errors++;
                }
              } else {
                const err86 = { instancePath: instancePath + "/numericEvidence/" + i3 + "/sceneId", schemaPath: "#/properties/numericEvidence/items/properties/sceneId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err86];
                } else {
                  vErrors.push(err86);
                }
                errors++;
              }
            }
          } else {
            const err87 = { instancePath: instancePath + "/numericEvidence/" + i3, schemaPath: "#/properties/numericEvidence/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err87];
            } else {
              vErrors.push(err87);
            }
            errors++;
          }
        }
      } else {
        const err88 = { instancePath: instancePath + "/numericEvidence", schemaPath: "#/properties/numericEvidence/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err88];
        } else {
          vErrors.push(err88);
        }
        errors++;
      }
    }
    if (data.ruleEvidence !== void 0) {
      let data35 = data.ruleEvidence;
      if (Array.isArray(data35)) {
        if (data35.length > 6) {
          const err89 = { instancePath: instancePath + "/ruleEvidence", schemaPath: "#/properties/ruleEvidence/maxItems", keyword: "maxItems", params: { limit: 6 }, message: "must NOT have more than 6 items" };
          if (vErrors === null) {
            vErrors = [err89];
          } else {
            vErrors.push(err89);
          }
          errors++;
        }
        const len3 = data35.length;
        for (let i4 = 0; i4 < len3; i4++) {
          let data36 = data35[i4];
          if (data36 && typeof data36 == "object" && !Array.isArray(data36)) {
            if (data36.missionId === void 0) {
              const err90 = { instancePath: instancePath + "/ruleEvidence/" + i4, schemaPath: "#/properties/ruleEvidence/items/required", keyword: "required", params: { missingProperty: "missionId" }, message: "must have required property 'missionId'" };
              if (vErrors === null) {
                vErrors = [err90];
              } else {
                vErrors.push(err90);
              }
              errors++;
            }
            if (data36.candidateExpression === void 0) {
              const err91 = { instancePath: instancePath + "/ruleEvidence/" + i4, schemaPath: "#/properties/ruleEvidence/items/required", keyword: "required", params: { missingProperty: "candidateExpression" }, message: "must have required property 'candidateExpression'" };
              if (vErrors === null) {
                vErrors = [err91];
              } else {
                vErrors.push(err91);
              }
              errors++;
            }
            if (data36.numericEvidence === void 0) {
              const err92 = { instancePath: instancePath + "/ruleEvidence/" + i4, schemaPath: "#/properties/ruleEvidence/items/required", keyword: "required", params: { missingProperty: "numericEvidence" }, message: "must have required property 'numericEvidence'" };
              if (vErrors === null) {
                vErrors = [err92];
              } else {
                vErrors.push(err92);
              }
              errors++;
            }
            for (const key3 in data36) {
              if (!(key3 === "missionId" || key3 === "candidateExpression" || key3 === "lessonNote" || key3 === "numericEvidence")) {
                const err93 = { instancePath: instancePath + "/ruleEvidence/" + i4, schemaPath: "#/properties/ruleEvidence/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err93];
                } else {
                  vErrors.push(err93);
                }
                errors++;
              }
            }
            if (data36.missionId !== void 0) {
              let data37 = data36.missionId;
              if (typeof data37 !== "string") {
                const err94 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/missionId", schemaPath: "#/properties/ruleEvidence/items/properties/missionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err94];
                } else {
                  vErrors.push(err94);
                }
                errors++;
              }
              if (!(data37 === "M01" || data37 === "M02" || data37 === "M03" || data37 === "M04" || data37 === "M05" || data37 === "M06")) {
                const err95 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/missionId", schemaPath: "#/properties/ruleEvidence/items/properties/missionId/enum", keyword: "enum", params: { allowedValues: schema31.properties.ruleEvidence.items.properties.missionId.enum }, message: "must be equal to one of the allowed values" };
                if (vErrors === null) {
                  vErrors = [err95];
                } else {
                  vErrors.push(err95);
                }
                errors++;
              }
            }
            if (data36.candidateExpression !== void 0) {
              let data38 = data36.candidateExpression;
              if (typeof data38 === "string") {
                if (func1(data38) > 120) {
                  const err96 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/candidateExpression", schemaPath: "#/properties/ruleEvidence/items/properties/candidateExpression/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
                  if (vErrors === null) {
                    vErrors = [err96];
                  } else {
                    vErrors.push(err96);
                  }
                  errors++;
                }
                if (func1(data38) < 1) {
                  const err97 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/candidateExpression", schemaPath: "#/properties/ruleEvidence/items/properties/candidateExpression/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  if (vErrors === null) {
                    vErrors = [err97];
                  } else {
                    vErrors.push(err97);
                  }
                  errors++;
                }
              } else {
                const err98 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/candidateExpression", schemaPath: "#/properties/ruleEvidence/items/properties/candidateExpression/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err98];
                } else {
                  vErrors.push(err98);
                }
                errors++;
              }
            }
            if (data36.lessonNote !== void 0) {
              let data39 = data36.lessonNote;
              const _errs89 = errors;
              let valid26 = true;
              const _errs90 = errors;
              if (data39 && typeof data39 == "object" && !Array.isArray(data39)) {
                if (data39.source !== void 0) {
                  if ("skipped" !== data39.source) {
                    const err99 = {};
                    if (vErrors === null) {
                      vErrors = [err99];
                    } else {
                      vErrors.push(err99);
                    }
                    errors++;
                  }
                }
              }
              var _valid4 = _errs90 === errors;
              errors = _errs89;
              if (vErrors !== null) {
                if (_errs89) {
                  vErrors.length = _errs89;
                } else {
                  vErrors = null;
                }
              }
              let ifClause0;
              if (_valid4) {
                const _errs92 = errors;
                if (data39 && typeof data39 == "object" && !Array.isArray(data39)) {
                  if (data39.pikoParaphrasePL !== void 0) {
                    if (data39.pikoParaphrasePL !== null) {
                      const err100 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/then/properties/pikoParaphrasePL/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                      if (vErrors === null) {
                        vErrors = [err100];
                      } else {
                        vErrors.push(err100);
                      }
                      errors++;
                    }
                  }
                }
                var _valid4 = _errs92 === errors;
                valid26 = _valid4;
                if (valid26) {
                  var props4 = {};
                  props4.pikoParaphrasePL = true;
                  props4.source = true;
                }
                ifClause0 = "then";
              } else {
                const _errs95 = errors;
                if (data39 && typeof data39 == "object" && !Array.isArray(data39)) {
                  if (data39.pikoParaphrasePL !== void 0) {
                    if (typeof data39.pikoParaphrasePL !== "string") {
                      const err101 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/else/properties/pikoParaphrasePL/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err101];
                      } else {
                        vErrors.push(err101);
                      }
                      errors++;
                    }
                  }
                }
                var _valid4 = _errs95 === errors;
                valid26 = _valid4;
                if (valid26) {
                  if (props4 !== true) {
                    props4 = props4 || {};
                    props4.pikoParaphrasePL = true;
                  }
                }
                ifClause0 = "else";
              }
              if (!valid26) {
                const err102 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/if", keyword: "if", params: { failingKeyword: ifClause0 }, message: 'must match "' + ifClause0 + '" schema' };
                if (vErrors === null) {
                  vErrors = [err102];
                } else {
                  vErrors.push(err102);
                }
                errors++;
              }
              if (data39 && typeof data39 == "object" && !Array.isArray(data39)) {
                if (data39.version === void 0) {
                  const err103 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
                  if (vErrors === null) {
                    vErrors = [err103];
                  } else {
                    vErrors.push(err103);
                  }
                  errors++;
                }
                if (data39.ruleId === void 0) {
                  const err104 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/required", keyword: "required", params: { missingProperty: "ruleId" }, message: "must have required property 'ruleId'" };
                  if (vErrors === null) {
                    vErrors = [err104];
                  } else {
                    vErrors.push(err104);
                  }
                  errors++;
                }
                if (data39.explanationPL === void 0) {
                  const err105 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/required", keyword: "required", params: { missingProperty: "explanationPL" }, message: "must have required property 'explanationPL'" };
                  if (vErrors === null) {
                    vErrors = [err105];
                  } else {
                    vErrors.push(err105);
                  }
                  errors++;
                }
                if (data39.pikoParaphrasePL === void 0) {
                  const err106 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/required", keyword: "required", params: { missingProperty: "pikoParaphrasePL" }, message: "must have required property 'pikoParaphrasePL'" };
                  if (vErrors === null) {
                    vErrors = [err106];
                  } else {
                    vErrors.push(err106);
                  }
                  errors++;
                }
                if (data39.source === void 0) {
                  const err107 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
                  if (vErrors === null) {
                    vErrors = [err107];
                  } else {
                    vErrors.push(err107);
                  }
                  errors++;
                }
                if (data39.confirmation === void 0) {
                  const err108 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/required", keyword: "required", params: { missingProperty: "confirmation" }, message: "must have required property 'confirmation'" };
                  if (vErrors === null) {
                    vErrors = [err108];
                  } else {
                    vErrors.push(err108);
                  }
                  errors++;
                }
                for (const key4 in data39) {
                  if (!(key4 === "version" || key4 === "ruleId" || key4 === "explanationPL" || key4 === "pikoParaphrasePL" || key4 === "source" || key4 === "confirmation")) {
                    const err109 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                      vErrors = [err109];
                    } else {
                      vErrors.push(err109);
                    }
                    errors++;
                  }
                }
                if (data39.version !== void 0) {
                  if (1 !== data39.version) {
                    const err110 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/version", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
                    if (vErrors === null) {
                      vErrors = [err110];
                    } else {
                      vErrors.push(err110);
                    }
                    errors++;
                  }
                }
                if (data39.ruleId !== void 0) {
                  let data44 = data39.ruleId;
                  if (typeof data44 === "string") {
                    if (func1(data44) > 40) {
                      const err111 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/ruleId", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/ruleId/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
                      if (vErrors === null) {
                        vErrors = [err111];
                      } else {
                        vErrors.push(err111);
                      }
                      errors++;
                    }
                    if (!pattern9.test(data44)) {
                      const err112 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/ruleId", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/ruleId/pattern", keyword: "pattern", params: { pattern: "^RULE_[A-Z_]+$" }, message: 'must match pattern "^RULE_[A-Z_]+$"' };
                      if (vErrors === null) {
                        vErrors = [err112];
                      } else {
                        vErrors.push(err112);
                      }
                      errors++;
                    }
                  } else {
                    const err113 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/ruleId", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/ruleId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err113];
                    } else {
                      vErrors.push(err113);
                    }
                    errors++;
                  }
                }
                if (data39.explanationPL !== void 0) {
                  let data45 = data39.explanationPL;
                  if (typeof data45 === "string") {
                    if (func1(data45) > 600) {
                      const err114 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/explanationPL", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/explanationPL/maxLength", keyword: "maxLength", params: { limit: 600 }, message: "must NOT have more than 600 characters" };
                      if (vErrors === null) {
                        vErrors = [err114];
                      } else {
                        vErrors.push(err114);
                      }
                      errors++;
                    }
                    if (func1(data45) < 1) {
                      const err115 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/explanationPL", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/explanationPL/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                      if (vErrors === null) {
                        vErrors = [err115];
                      } else {
                        vErrors.push(err115);
                      }
                      errors++;
                    }
                  } else {
                    const err116 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/explanationPL", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/explanationPL/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err116];
                    } else {
                      vErrors.push(err116);
                    }
                    errors++;
                  }
                }
                if (data39.pikoParaphrasePL !== void 0) {
                  let data46 = data39.pikoParaphrasePL;
                  if (typeof data46 !== "string" && data46 !== null) {
                    const err117 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/pikoParaphrasePL/type", keyword: "type", params: { type: schema31.properties.ruleEvidence.items.properties.lessonNote.properties.pikoParaphrasePL.type }, message: "must be string,null" };
                    if (vErrors === null) {
                      vErrors = [err117];
                    } else {
                      vErrors.push(err117);
                    }
                    errors++;
                  }
                  if (typeof data46 === "string") {
                    if (func1(data46) > 450) {
                      const err118 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/pikoParaphrasePL/maxLength", keyword: "maxLength", params: { limit: 450 }, message: "must NOT have more than 450 characters" };
                      if (vErrors === null) {
                        vErrors = [err118];
                      } else {
                        vErrors.push(err118);
                      }
                      errors++;
                    }
                    if (func1(data46) < 1) {
                      const err119 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/pikoParaphrasePL/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                      if (vErrors === null) {
                        vErrors = [err119];
                      } else {
                        vErrors.push(err119);
                      }
                      errors++;
                    }
                  }
                }
                if (data39.source !== void 0) {
                  let data47 = data39.source;
                  if (!(data47 === "live" || data47 === "demo" || data47 === "skipped")) {
                    const err120 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/source", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/source/enum", keyword: "enum", params: { allowedValues: schema31.properties.ruleEvidence.items.properties.lessonNote.properties.source.enum }, message: "must be equal to one of the allowed values" };
                    if (vErrors === null) {
                      vErrors = [err120];
                    } else {
                      vErrors.push(err120);
                    }
                    errors++;
                  }
                }
                if (data39.confirmation !== void 0) {
                  if ("saved_by_player" !== data39.confirmation) {
                    const err121 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote/confirmation", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/properties/confirmation/const", keyword: "const", params: { allowedValue: "saved_by_player" }, message: "must be equal to constant" };
                    if (vErrors === null) {
                      vErrors = [err121];
                    } else {
                      vErrors.push(err121);
                    }
                    errors++;
                  }
                }
              } else {
                const err122 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/lessonNote", schemaPath: "#/properties/ruleEvidence/items/properties/lessonNote/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err122];
                } else {
                  vErrors.push(err122);
                }
                errors++;
              }
            }
            if (data36.numericEvidence !== void 0) {
              let data49 = data36.numericEvidence;
              if (Array.isArray(data49)) {
                if (data49.length > 2) {
                  const err123 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/maxItems", keyword: "maxItems", params: { limit: 2 }, message: "must NOT have more than 2 items" };
                  if (vErrors === null) {
                    vErrors = [err123];
                  } else {
                    vErrors.push(err123);
                  }
                  errors++;
                }
                if (data49.length < 2) {
                  const err124 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/minItems", keyword: "minItems", params: { limit: 2 }, message: "must NOT have fewer than 2 items" };
                  if (vErrors === null) {
                    vErrors = [err124];
                  } else {
                    vErrors.push(err124);
                  }
                  errors++;
                }
                const len4 = data49.length;
                for (let i5 = 0; i5 < len4; i5++) {
                  let data50 = data49[i5];
                  if (data50 && typeof data50 == "object" && !Array.isArray(data50)) {
                    if (data50.sceneId === void 0) {
                      const err125 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5, schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/required", keyword: "required", params: { missingProperty: "sceneId" }, message: "must have required property 'sceneId'" };
                      if (vErrors === null) {
                        vErrors = [err125];
                      } else {
                        vErrors.push(err125);
                      }
                      errors++;
                    }
                    if (data50.checkpointId === void 0) {
                      const err126 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5, schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/required", keyword: "required", params: { missingProperty: "checkpointId" }, message: "must have required property 'checkpointId'" };
                      if (vErrors === null) {
                        vErrors = [err126];
                      } else {
                        vErrors.push(err126);
                      }
                      errors++;
                    }
                    if (data50.submittedY === void 0) {
                      const err127 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5, schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/required", keyword: "required", params: { missingProperty: "submittedY" }, message: "must have required property 'submittedY'" };
                      if (vErrors === null) {
                        vErrors = [err127];
                      } else {
                        vErrors.push(err127);
                      }
                      errors++;
                    }
                    for (const key5 in data50) {
                      if (!(key5 === "checkpointId" || key5 === "submittedY" || key5 === "sceneId")) {
                        const err128 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5, schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
                        if (vErrors === null) {
                          vErrors = [err128];
                        } else {
                          vErrors.push(err128);
                        }
                        errors++;
                      }
                    }
                    if (data50.checkpointId !== void 0) {
                      let data51 = data50.checkpointId;
                      if (typeof data51 !== "string") {
                        const err129 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5 + "/checkpointId", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/properties/checkpointId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err129];
                        } else {
                          vErrors.push(err129);
                        }
                        errors++;
                      }
                      if (!(data51 === "G1" || data51 === "G2")) {
                        const err130 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5 + "/checkpointId", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/properties/checkpointId/enum", keyword: "enum", params: { allowedValues: schema31.properties.ruleEvidence.items.properties.numericEvidence.items.properties.checkpointId.enum }, message: "must be equal to one of the allowed values" };
                        if (vErrors === null) {
                          vErrors = [err130];
                        } else {
                          vErrors.push(err130);
                        }
                        errors++;
                      }
                    }
                    if (data50.submittedY !== void 0) {
                      let data52 = data50.submittedY;
                      if (typeof data52 == "number") {
                        if (data52 > 1e8 || isNaN(data52)) {
                          const err131 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5 + "/submittedY", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/properties/submittedY/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e8 }, message: "must be <= 100000000" };
                          if (vErrors === null) {
                            vErrors = [err131];
                          } else {
                            vErrors.push(err131);
                          }
                          errors++;
                        }
                        if (data52 < -1e8 || isNaN(data52)) {
                          const err132 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5 + "/submittedY", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/properties/submittedY/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e8 }, message: "must be >= -100000000" };
                          if (vErrors === null) {
                            vErrors = [err132];
                          } else {
                            vErrors.push(err132);
                          }
                          errors++;
                        }
                      } else {
                        const err133 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5 + "/submittedY", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/properties/submittedY/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                        if (vErrors === null) {
                          vErrors = [err133];
                        } else {
                          vErrors.push(err133);
                        }
                        errors++;
                      }
                    }
                    if (data50.sceneId !== void 0) {
                      let data53 = data50.sceneId;
                      if (typeof data53 === "string") {
                        if (!pattern8.test(data53)) {
                          const err134 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5 + "/sceneId", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/properties/sceneId/pattern", keyword: "pattern", params: { pattern: "^M0[1-6]-teach$" }, message: 'must match pattern "^M0[1-6]-teach$"' };
                          if (vErrors === null) {
                            vErrors = [err134];
                          } else {
                            vErrors.push(err134);
                          }
                          errors++;
                        }
                      } else {
                        const err135 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5 + "/sceneId", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/properties/sceneId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err135];
                        } else {
                          vErrors.push(err135);
                        }
                        errors++;
                      }
                    }
                  } else {
                    const err136 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence/" + i5, schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                      vErrors = [err136];
                    } else {
                      vErrors.push(err136);
                    }
                    errors++;
                  }
                }
              } else {
                const err137 = { instancePath: instancePath + "/ruleEvidence/" + i4 + "/numericEvidence", schemaPath: "#/properties/ruleEvidence/items/properties/numericEvidence/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                if (vErrors === null) {
                  vErrors = [err137];
                } else {
                  vErrors.push(err137);
                }
                errors++;
              }
            }
          } else {
            const err138 = { instancePath: instancePath + "/ruleEvidence/" + i4, schemaPath: "#/properties/ruleEvidence/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err138];
            } else {
              vErrors.push(err138);
            }
            errors++;
          }
        }
      } else {
        const err139 = { instancePath: instancePath + "/ruleEvidence", schemaPath: "#/properties/ruleEvidence/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err139];
        } else {
          vErrors.push(err139);
        }
        errors++;
      }
    }
  } else {
    const err140 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err140];
    } else {
      vErrors.push(err140);
    }
    errors++;
  }
  validate20.errors = vErrors;
  return errors === 0;
}
validate20.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var validateModel = validate21;
var schema32 = { "$schema": "https://json-schema.org/draft/2020-12/schema", "$id": "urn:naucz-pilota:ai-model-response:v1", "title": "Naucz Pilota \u2014 strict model payload v1", "description": "Wy\u0142\u0105cznie tre\u015B\u0107 zwracana przez model. Status trybu, wynik silnika i metadane nale\u017C\u0105 do osobnej koperty aplikacji.", "type": "object", "additionalProperties": false, "properties": { "utterancePL": { "type": "string", "minLength": 1, "maxLength": 450, "description": "Kr\xF3tka wypowied\u017A Piko po polsku. Zwyk\u0142y tekst, bez HTML i bez deklaracji zaliczenia." }, "followUpPL": { "type": ["string", "null"], "minLength": 1, "maxLength": 200, "description": "Jedno kr\xF3tkie pytanie lub null." }, "explanationAssessment": { "type": "string", "enum": ["sound", "partial", "incorrect", "unclear", "not_applicable"], "description": "Orientacyjny komentarz do wyja\u015Bnienia; nigdy pr\xF3g zaliczenia." }, "proposedExpression": { "type": ["string", "null"], "minLength": 1, "maxLength": 120, "description": "W teach zawsze null. W robot_transfer wz\xF3r do niezale\u017Cnego sprawdzenia lub null, gdy Piko zg\u0142asza niepewno\u015B\u0107." }, "suggestedRuleId": { "type": ["string", "null"], "enum": ["RULE_LINE_INTERCEPT", "RULE_LINE_SLOPE", "RULE_QUAD_VERTICAL", "RULE_QUAD_HORIZONTAL", "RULE_QUAD_CURVATURE", "RULE_COMBINE", null], "description": "Wy\u0142\u0105cznie sugestia dotycz\u0105ca regu\u0142y bie\u017C\u0105cej misji; nie zmienia pami\u0119ci." }, "usedFactIds": { "type": "array", "maxItems": 8, "items": { "type": "string", "minLength": 1, "maxLength": 80 }, "description": "Identyfikatory fakt\xF3w z bie\u017C\u0105cego kontekstu; backend sprawdza, czy istniej\u0105." }, "action": { "type": "string", "enum": ["ask_question", "explain_back", "propose_attempt", "acknowledge_uncertainty"] } }, "required": ["utterancePL", "followUpPL", "explanationAssessment", "proposedExpression", "suggestedRuleId", "usedFactIds", "action"] };
function validate21(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate21.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.utterancePL === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "utterancePL" }, message: "must have required property 'utterancePL'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.followUpPL === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "followUpPL" }, message: "must have required property 'followUpPL'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.explanationAssessment === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "explanationAssessment" }, message: "must have required property 'explanationAssessment'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.proposedExpression === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "proposedExpression" }, message: "must have required property 'proposedExpression'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.suggestedRuleId === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "suggestedRuleId" }, message: "must have required property 'suggestedRuleId'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.usedFactIds === void 0) {
      const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "usedFactIds" }, message: "must have required property 'usedFactIds'" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.action === void 0) {
      const err6 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "utterancePL" || key0 === "followUpPL" || key0 === "explanationAssessment" || key0 === "proposedExpression" || key0 === "suggestedRuleId" || key0 === "usedFactIds" || key0 === "action")) {
        const err7 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.utterancePL !== void 0) {
      let data0 = data.utterancePL;
      if (typeof data0 === "string") {
        if (func1(data0) > 450) {
          const err8 = { instancePath: instancePath + "/utterancePL", schemaPath: "#/properties/utterancePL/maxLength", keyword: "maxLength", params: { limit: 450 }, message: "must NOT have more than 450 characters" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (func1(data0) < 1) {
          const err9 = { instancePath: instancePath + "/utterancePL", schemaPath: "#/properties/utterancePL/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = { instancePath: instancePath + "/utterancePL", schemaPath: "#/properties/utterancePL/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.followUpPL !== void 0) {
      let data1 = data.followUpPL;
      if (typeof data1 !== "string" && data1 !== null) {
        const err11 = { instancePath: instancePath + "/followUpPL", schemaPath: "#/properties/followUpPL/type", keyword: "type", params: { type: schema32.properties.followUpPL.type }, message: "must be string,null" };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      if (typeof data1 === "string") {
        if (func1(data1) > 200) {
          const err12 = { instancePath: instancePath + "/followUpPL", schemaPath: "#/properties/followUpPL/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (func1(data1) < 1) {
          const err13 = { instancePath: instancePath + "/followUpPL", schemaPath: "#/properties/followUpPL/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
      }
    }
    if (data.explanationAssessment !== void 0) {
      let data2 = data.explanationAssessment;
      if (typeof data2 !== "string") {
        const err14 = { instancePath: instancePath + "/explanationAssessment", schemaPath: "#/properties/explanationAssessment/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
      if (!(data2 === "sound" || data2 === "partial" || data2 === "incorrect" || data2 === "unclear" || data2 === "not_applicable")) {
        const err15 = { instancePath: instancePath + "/explanationAssessment", schemaPath: "#/properties/explanationAssessment/enum", keyword: "enum", params: { allowedValues: schema32.properties.explanationAssessment.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.proposedExpression !== void 0) {
      let data3 = data.proposedExpression;
      if (typeof data3 !== "string" && data3 !== null) {
        const err16 = { instancePath: instancePath + "/proposedExpression", schemaPath: "#/properties/proposedExpression/type", keyword: "type", params: { type: schema32.properties.proposedExpression.type }, message: "must be string,null" };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
      if (typeof data3 === "string") {
        if (func1(data3) > 120) {
          const err17 = { instancePath: instancePath + "/proposedExpression", schemaPath: "#/properties/proposedExpression/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (func1(data3) < 1) {
          const err18 = { instancePath: instancePath + "/proposedExpression", schemaPath: "#/properties/proposedExpression/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
      }
    }
    if (data.suggestedRuleId !== void 0) {
      let data4 = data.suggestedRuleId;
      if (typeof data4 !== "string" && data4 !== null) {
        const err19 = { instancePath: instancePath + "/suggestedRuleId", schemaPath: "#/properties/suggestedRuleId/type", keyword: "type", params: { type: schema32.properties.suggestedRuleId.type }, message: "must be string,null" };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
      if (!(data4 === "RULE_LINE_INTERCEPT" || data4 === "RULE_LINE_SLOPE" || data4 === "RULE_QUAD_VERTICAL" || data4 === "RULE_QUAD_HORIZONTAL" || data4 === "RULE_QUAD_CURVATURE" || data4 === "RULE_COMBINE" || data4 === null)) {
        const err20 = { instancePath: instancePath + "/suggestedRuleId", schemaPath: "#/properties/suggestedRuleId/enum", keyword: "enum", params: { allowedValues: schema32.properties.suggestedRuleId.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.usedFactIds !== void 0) {
      let data5 = data.usedFactIds;
      if (Array.isArray(data5)) {
        if (data5.length > 8) {
          const err21 = { instancePath: instancePath + "/usedFactIds", schemaPath: "#/properties/usedFactIds/maxItems", keyword: "maxItems", params: { limit: 8 }, message: "must NOT have more than 8 items" };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
        const len0 = data5.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data6 = data5[i0];
          if (typeof data6 === "string") {
            if (func1(data6) > 80) {
              const err22 = { instancePath: instancePath + "/usedFactIds/" + i0, schemaPath: "#/properties/usedFactIds/items/maxLength", keyword: "maxLength", params: { limit: 80 }, message: "must NOT have more than 80 characters" };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err23 = { instancePath: instancePath + "/usedFactIds/" + i0, schemaPath: "#/properties/usedFactIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
            }
          } else {
            const err24 = { instancePath: instancePath + "/usedFactIds/" + i0, schemaPath: "#/properties/usedFactIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err24];
            } else {
              vErrors.push(err24);
            }
            errors++;
          }
        }
      } else {
        const err25 = { instancePath: instancePath + "/usedFactIds", schemaPath: "#/properties/usedFactIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
    if (data.action !== void 0) {
      let data7 = data.action;
      if (typeof data7 !== "string") {
        const err26 = { instancePath: instancePath + "/action", schemaPath: "#/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
      if (!(data7 === "ask_question" || data7 === "explain_back" || data7 === "propose_attempt" || data7 === "acknowledge_uncertainty")) {
        const err27 = { instancePath: instancePath + "/action", schemaPath: "#/properties/action/enum", keyword: "enum", params: { allowedValues: schema32.properties.action.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
  } else {
    const err28 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err28];
    } else {
      vErrors.push(err28);
    }
    errors++;
  }
  validate21.errors = vErrors;
  return errors === 0;
}
validate21.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var validateRuleEvidence = validate22;
var schema33 = { "type": "object", "additionalProperties": false, "properties": { "missionId": { "type": "string", "enum": ["M01", "M02", "M03", "M04", "M05", "M06"] }, "candidateExpression": { "type": "string", "minLength": 1, "maxLength": 120 }, "lessonNote": { "type": "object", "additionalProperties": false, "properties": { "version": { "const": 1 }, "ruleId": { "type": "string", "pattern": "^RULE_[A-Z_]+$", "maxLength": 40 }, "explanationPL": { "type": "string", "minLength": 1, "maxLength": 600 }, "pikoParaphrasePL": { "type": ["string", "null"], "minLength": 1, "maxLength": 450 }, "source": { "enum": ["live", "demo", "skipped"] }, "confirmation": { "const": "saved_by_player" } }, "required": ["version", "ruleId", "explanationPL", "pikoParaphrasePL", "source", "confirmation"], "if": { "properties": { "source": { "const": "skipped" } } }, "then": { "properties": { "pikoParaphrasePL": { "type": "null" } } }, "else": { "properties": { "pikoParaphrasePL": { "type": "string" } } } }, "numericEvidence": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": "object", "additionalProperties": false, "properties": { "checkpointId": { "type": "string", "enum": ["G1", "G2"] }, "submittedY": { "type": "number", "minimum": -1e8, "maximum": 1e8 }, "sceneId": { "type": "string", "pattern": "^M0[1-6]-teach$" } }, "required": ["sceneId", "checkpointId", "submittedY"] } } }, "required": ["missionId", "candidateExpression", "numericEvidence"] };
function validate22(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate22.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.missionId === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "missionId" }, message: "must have required property 'missionId'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.candidateExpression === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "candidateExpression" }, message: "must have required property 'candidateExpression'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.numericEvidence === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "numericEvidence" }, message: "must have required property 'numericEvidence'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "missionId" || key0 === "candidateExpression" || key0 === "lessonNote" || key0 === "numericEvidence")) {
        const err3 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.missionId !== void 0) {
      let data0 = data.missionId;
      if (typeof data0 !== "string") {
        const err4 = { instancePath: instancePath + "/missionId", schemaPath: "#/properties/missionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (!(data0 === "M01" || data0 === "M02" || data0 === "M03" || data0 === "M04" || data0 === "M05" || data0 === "M06")) {
        const err5 = { instancePath: instancePath + "/missionId", schemaPath: "#/properties/missionId/enum", keyword: "enum", params: { allowedValues: schema33.properties.missionId.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.candidateExpression !== void 0) {
      let data1 = data.candidateExpression;
      if (typeof data1 === "string") {
        if (func1(data1) > 120) {
          const err6 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/properties/candidateExpression/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (func1(data1) < 1) {
          const err7 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/properties/candidateExpression/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = { instancePath: instancePath + "/candidateExpression", schemaPath: "#/properties/candidateExpression/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.lessonNote !== void 0) {
      let data2 = data.lessonNote;
      const _errs8 = errors;
      let valid1 = true;
      const _errs9 = errors;
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.source !== void 0) {
          if ("skipped" !== data2.source) {
            const err9 = {};
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
      }
      var _valid0 = _errs9 === errors;
      errors = _errs8;
      if (vErrors !== null) {
        if (_errs8) {
          vErrors.length = _errs8;
        } else {
          vErrors = null;
        }
      }
      let ifClause0;
      if (_valid0) {
        const _errs11 = errors;
        if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
          if (data2.pikoParaphrasePL !== void 0) {
            if (data2.pikoParaphrasePL !== null) {
              const err10 = { instancePath: instancePath + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/lessonNote/then/properties/pikoParaphrasePL/type", keyword: "type", params: { type: "null" }, message: "must be null" };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
          }
        }
        var _valid0 = _errs11 === errors;
        valid1 = _valid0;
        if (valid1) {
          var props0 = {};
          props0.pikoParaphrasePL = true;
          props0.source = true;
        }
        ifClause0 = "then";
      } else {
        const _errs14 = errors;
        if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
          if (data2.pikoParaphrasePL !== void 0) {
            if (typeof data2.pikoParaphrasePL !== "string") {
              const err11 = { instancePath: instancePath + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/lessonNote/else/properties/pikoParaphrasePL/type", keyword: "type", params: { type: "string" }, message: "must be string" };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
          }
        }
        var _valid0 = _errs14 === errors;
        valid1 = _valid0;
        if (valid1) {
          if (props0 !== true) {
            props0 = props0 || {};
            props0.pikoParaphrasePL = true;
          }
        }
        ifClause0 = "else";
      }
      if (!valid1) {
        const err12 = { instancePath: instancePath + "/lessonNote", schemaPath: "#/properties/lessonNote/if", keyword: "if", params: { failingKeyword: ifClause0 }, message: 'must match "' + ifClause0 + '" schema' };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.version === void 0) {
          const err13 = { instancePath: instancePath + "/lessonNote", schemaPath: "#/properties/lessonNote/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (data2.ruleId === void 0) {
          const err14 = { instancePath: instancePath + "/lessonNote", schemaPath: "#/properties/lessonNote/required", keyword: "required", params: { missingProperty: "ruleId" }, message: "must have required property 'ruleId'" };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        if (data2.explanationPL === void 0) {
          const err15 = { instancePath: instancePath + "/lessonNote", schemaPath: "#/properties/lessonNote/required", keyword: "required", params: { missingProperty: "explanationPL" }, message: "must have required property 'explanationPL'" };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        if (data2.pikoParaphrasePL === void 0) {
          const err16 = { instancePath: instancePath + "/lessonNote", schemaPath: "#/properties/lessonNote/required", keyword: "required", params: { missingProperty: "pikoParaphrasePL" }, message: "must have required property 'pikoParaphrasePL'" };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (data2.source === void 0) {
          const err17 = { instancePath: instancePath + "/lessonNote", schemaPath: "#/properties/lessonNote/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data2.confirmation === void 0) {
          const err18 = { instancePath: instancePath + "/lessonNote", schemaPath: "#/properties/lessonNote/required", keyword: "required", params: { missingProperty: "confirmation" }, message: "must have required property 'confirmation'" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        for (const key1 in data2) {
          if (!(key1 === "version" || key1 === "ruleId" || key1 === "explanationPL" || key1 === "pikoParaphrasePL" || key1 === "source" || key1 === "confirmation")) {
            const err19 = { instancePath: instancePath + "/lessonNote", schemaPath: "#/properties/lessonNote/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err19];
            } else {
              vErrors.push(err19);
            }
            errors++;
          }
        }
        if (data2.version !== void 0) {
          if (1 !== data2.version) {
            const err20 = { instancePath: instancePath + "/lessonNote/version", schemaPath: "#/properties/lessonNote/properties/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
        }
        if (data2.ruleId !== void 0) {
          let data7 = data2.ruleId;
          if (typeof data7 === "string") {
            if (func1(data7) > 40) {
              const err21 = { instancePath: instancePath + "/lessonNote/ruleId", schemaPath: "#/properties/lessonNote/properties/ruleId/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
              if (vErrors === null) {
                vErrors = [err21];
              } else {
                vErrors.push(err21);
              }
              errors++;
            }
            if (!pattern9.test(data7)) {
              const err22 = { instancePath: instancePath + "/lessonNote/ruleId", schemaPath: "#/properties/lessonNote/properties/ruleId/pattern", keyword: "pattern", params: { pattern: "^RULE_[A-Z_]+$" }, message: 'must match pattern "^RULE_[A-Z_]+$"' };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
          } else {
            const err23 = { instancePath: instancePath + "/lessonNote/ruleId", schemaPath: "#/properties/lessonNote/properties/ruleId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          }
        }
        if (data2.explanationPL !== void 0) {
          let data8 = data2.explanationPL;
          if (typeof data8 === "string") {
            if (func1(data8) > 600) {
              const err24 = { instancePath: instancePath + "/lessonNote/explanationPL", schemaPath: "#/properties/lessonNote/properties/explanationPL/maxLength", keyword: "maxLength", params: { limit: 600 }, message: "must NOT have more than 600 characters" };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
            if (func1(data8) < 1) {
              const err25 = { instancePath: instancePath + "/lessonNote/explanationPL", schemaPath: "#/properties/lessonNote/properties/explanationPL/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err25];
              } else {
                vErrors.push(err25);
              }
              errors++;
            }
          } else {
            const err26 = { instancePath: instancePath + "/lessonNote/explanationPL", schemaPath: "#/properties/lessonNote/properties/explanationPL/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
        if (data2.pikoParaphrasePL !== void 0) {
          let data9 = data2.pikoParaphrasePL;
          if (typeof data9 !== "string" && data9 !== null) {
            const err27 = { instancePath: instancePath + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/lessonNote/properties/pikoParaphrasePL/type", keyword: "type", params: { type: schema33.properties.lessonNote.properties.pikoParaphrasePL.type }, message: "must be string,null" };
            if (vErrors === null) {
              vErrors = [err27];
            } else {
              vErrors.push(err27);
            }
            errors++;
          }
          if (typeof data9 === "string") {
            if (func1(data9) > 450) {
              const err28 = { instancePath: instancePath + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/lessonNote/properties/pikoParaphrasePL/maxLength", keyword: "maxLength", params: { limit: 450 }, message: "must NOT have more than 450 characters" };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
            if (func1(data9) < 1) {
              const err29 = { instancePath: instancePath + "/lessonNote/pikoParaphrasePL", schemaPath: "#/properties/lessonNote/properties/pikoParaphrasePL/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err29];
              } else {
                vErrors.push(err29);
              }
              errors++;
            }
          }
        }
        if (data2.source !== void 0) {
          let data10 = data2.source;
          if (!(data10 === "live" || data10 === "demo" || data10 === "skipped")) {
            const err30 = { instancePath: instancePath + "/lessonNote/source", schemaPath: "#/properties/lessonNote/properties/source/enum", keyword: "enum", params: { allowedValues: schema33.properties.lessonNote.properties.source.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err30];
            } else {
              vErrors.push(err30);
            }
            errors++;
          }
        }
        if (data2.confirmation !== void 0) {
          if ("saved_by_player" !== data2.confirmation) {
            const err31 = { instancePath: instancePath + "/lessonNote/confirmation", schemaPath: "#/properties/lessonNote/properties/confirmation/const", keyword: "const", params: { allowedValue: "saved_by_player" }, message: "must be equal to constant" };
            if (vErrors === null) {
              vErrors = [err31];
            } else {
              vErrors.push(err31);
            }
            errors++;
          }
        }
      } else {
        const err32 = { instancePath: instancePath + "/lessonNote", schemaPath: "#/properties/lessonNote/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
    if (data.numericEvidence !== void 0) {
      let data12 = data.numericEvidence;
      if (Array.isArray(data12)) {
        if (data12.length > 2) {
          const err33 = { instancePath: instancePath + "/numericEvidence", schemaPath: "#/properties/numericEvidence/maxItems", keyword: "maxItems", params: { limit: 2 }, message: "must NOT have more than 2 items" };
          if (vErrors === null) {
            vErrors = [err33];
          } else {
            vErrors.push(err33);
          }
          errors++;
        }
        if (data12.length < 2) {
          const err34 = { instancePath: instancePath + "/numericEvidence", schemaPath: "#/properties/numericEvidence/minItems", keyword: "minItems", params: { limit: 2 }, message: "must NOT have fewer than 2 items" };
          if (vErrors === null) {
            vErrors = [err34];
          } else {
            vErrors.push(err34);
          }
          errors++;
        }
        const len0 = data12.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data13 = data12[i0];
          if (data13 && typeof data13 == "object" && !Array.isArray(data13)) {
            if (data13.sceneId === void 0) {
              const err35 = { instancePath: instancePath + "/numericEvidence/" + i0, schemaPath: "#/properties/numericEvidence/items/required", keyword: "required", params: { missingProperty: "sceneId" }, message: "must have required property 'sceneId'" };
              if (vErrors === null) {
                vErrors = [err35];
              } else {
                vErrors.push(err35);
              }
              errors++;
            }
            if (data13.checkpointId === void 0) {
              const err36 = { instancePath: instancePath + "/numericEvidence/" + i0, schemaPath: "#/properties/numericEvidence/items/required", keyword: "required", params: { missingProperty: "checkpointId" }, message: "must have required property 'checkpointId'" };
              if (vErrors === null) {
                vErrors = [err36];
              } else {
                vErrors.push(err36);
              }
              errors++;
            }
            if (data13.submittedY === void 0) {
              const err37 = { instancePath: instancePath + "/numericEvidence/" + i0, schemaPath: "#/properties/numericEvidence/items/required", keyword: "required", params: { missingProperty: "submittedY" }, message: "must have required property 'submittedY'" };
              if (vErrors === null) {
                vErrors = [err37];
              } else {
                vErrors.push(err37);
              }
              errors++;
            }
            for (const key2 in data13) {
              if (!(key2 === "checkpointId" || key2 === "submittedY" || key2 === "sceneId")) {
                const err38 = { instancePath: instancePath + "/numericEvidence/" + i0, schemaPath: "#/properties/numericEvidence/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err38];
                } else {
                  vErrors.push(err38);
                }
                errors++;
              }
            }
            if (data13.checkpointId !== void 0) {
              let data14 = data13.checkpointId;
              if (typeof data14 !== "string") {
                const err39 = { instancePath: instancePath + "/numericEvidence/" + i0 + "/checkpointId", schemaPath: "#/properties/numericEvidence/items/properties/checkpointId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err39];
                } else {
                  vErrors.push(err39);
                }
                errors++;
              }
              if (!(data14 === "G1" || data14 === "G2")) {
                const err40 = { instancePath: instancePath + "/numericEvidence/" + i0 + "/checkpointId", schemaPath: "#/properties/numericEvidence/items/properties/checkpointId/enum", keyword: "enum", params: { allowedValues: schema33.properties.numericEvidence.items.properties.checkpointId.enum }, message: "must be equal to one of the allowed values" };
                if (vErrors === null) {
                  vErrors = [err40];
                } else {
                  vErrors.push(err40);
                }
                errors++;
              }
            }
            if (data13.submittedY !== void 0) {
              let data15 = data13.submittedY;
              if (typeof data15 == "number") {
                if (data15 > 1e8 || isNaN(data15)) {
                  const err41 = { instancePath: instancePath + "/numericEvidence/" + i0 + "/submittedY", schemaPath: "#/properties/numericEvidence/items/properties/submittedY/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e8 }, message: "must be <= 100000000" };
                  if (vErrors === null) {
                    vErrors = [err41];
                  } else {
                    vErrors.push(err41);
                  }
                  errors++;
                }
                if (data15 < -1e8 || isNaN(data15)) {
                  const err42 = { instancePath: instancePath + "/numericEvidence/" + i0 + "/submittedY", schemaPath: "#/properties/numericEvidence/items/properties/submittedY/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e8 }, message: "must be >= -100000000" };
                  if (vErrors === null) {
                    vErrors = [err42];
                  } else {
                    vErrors.push(err42);
                  }
                  errors++;
                }
              } else {
                const err43 = { instancePath: instancePath + "/numericEvidence/" + i0 + "/submittedY", schemaPath: "#/properties/numericEvidence/items/properties/submittedY/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err43];
                } else {
                  vErrors.push(err43);
                }
                errors++;
              }
            }
            if (data13.sceneId !== void 0) {
              let data16 = data13.sceneId;
              if (typeof data16 === "string") {
                if (!pattern8.test(data16)) {
                  const err44 = { instancePath: instancePath + "/numericEvidence/" + i0 + "/sceneId", schemaPath: "#/properties/numericEvidence/items/properties/sceneId/pattern", keyword: "pattern", params: { pattern: "^M0[1-6]-teach$" }, message: 'must match pattern "^M0[1-6]-teach$"' };
                  if (vErrors === null) {
                    vErrors = [err44];
                  } else {
                    vErrors.push(err44);
                  }
                  errors++;
                }
              } else {
                const err45 = { instancePath: instancePath + "/numericEvidence/" + i0 + "/sceneId", schemaPath: "#/properties/numericEvidence/items/properties/sceneId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err45];
                } else {
                  vErrors.push(err45);
                }
                errors++;
              }
            }
          } else {
            const err46 = { instancePath: instancePath + "/numericEvidence/" + i0, schemaPath: "#/properties/numericEvidence/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err46];
            } else {
              vErrors.push(err46);
            }
            errors++;
          }
        }
      } else {
        const err47 = { instancePath: instancePath + "/numericEvidence", schemaPath: "#/properties/numericEvidence/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err47];
        } else {
          vErrors.push(err47);
        }
        errors++;
      }
    }
  } else {
    const err48 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err48];
    } else {
      vErrors.push(err48);
    }
    errors++;
  }
  validate22.errors = vErrors;
  return errors === 0;
}
validate22.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
export {
  validateModel,
  validateRequest,
  validateRuleEvidence
};
