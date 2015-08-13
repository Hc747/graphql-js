/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

// 80+ char lines are useful in describe/it, so ignore in this file.
/* eslint-disable max-len */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  GraphQLSchema,
  GraphQLScalarType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from '../../';


var SomeScalarType = new GraphQLScalarType({
  name: 'SomeScalar',
  serialize() {},
  parseValue() {},
  parseLiteral() {}
});

var SomeObjectType = new GraphQLObjectType({
  name: 'SomeObject',
  fields: { f: { type: GraphQLString } }
});

var SomeUnionType = new GraphQLUnionType({
  name: 'SomeUnion',
  types: [ SomeObjectType ]
});

var SomeInterfaceType = new GraphQLInterfaceType({
  name: 'SomeInterface',
  fields: { f: { type: GraphQLString } }
});

var SomeEnumType = new GraphQLEnumType({
  name: 'SomeEnum',
  values: {
    ONLY: {}
  }
});

var SomeInputObjectType = new GraphQLInputObjectType({
  name: 'SomeInputObject',
  fields: {
    val: { type: GraphQLString, defaultValue: 'hello' }
  }
});

function withModifiers(types) {
  return types
    .concat(types.map(type => new GraphQLList(type)))
    .concat(types.map(type => new GraphQLNonNull(type)))
    .concat(types.map(type => new GraphQLNonNull(new GraphQLList(type))));
}

var outputTypes = withModifiers([
  SomeScalarType,
  SomeEnumType,
  SomeObjectType,
  SomeUnionType,
  SomeInterfaceType,
]);

var notOutputTypes = withModifiers([
  SomeInputObjectType,
]);

var inputTypes = withModifiers([
  SomeScalarType,
  SomeEnumType,
  SomeInputObjectType,
]);

var notInputTypes = withModifiers([
  SomeObjectType,
  SomeUnionType,
  SomeInterfaceType,
]);


describe('Type System: A schema must have Object root types', () => {

  it('rejects a schema without a query type', () => {
    expect(
      () => new GraphQLSchema({ })
    ).to.throw(
      'Schema query must be Object Type but got: undefined.'
    );
  });

  it('rejects a schema whose query type is an input type', () => {
    expect(
      () => new GraphQLSchema({ query: SomeInputObjectType })
    ).to.throw(
      'Schema query must be Object Type but got: SomeInputObject.'
    );
  });

  it('rejects a schema whose mutation type is an input type', () => {
    expect(
      () => new GraphQLSchema({
        query: SomeObjectType,
        mutation: SomeInputObjectType
      })
    ).to.throw(
      'Schema mutation must be Object Type if provided but got: SomeInputObject.'
    );
  });

});


describe('Type System: Objects must have fields', () => {

  function schemaWithObject(objectType) {
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          f: { type: objectType }
        }
      })
    });
  }

  it('accepts a schema with an object type with fields', () => {
    expect(
      () => schemaWithObject(new GraphQLObjectType({
        name: 'SomeObject',
        fields: {
          f: { type: GraphQLString }
        }
      }))
    ).not.to.throw();
  });

  it('accepts a schema with an object type with a field function', () => {
    expect(
      () => schemaWithObject(new GraphQLObjectType({
        name: 'SomeObject',
        fields() {
          return {
            f: { type: GraphQLString }
          };
        }
      }))
    ).not.to.throw();
  });

  it('rejects a schema with missing fields', () => {
    expect(
      () => schemaWithObject(new GraphQLObjectType({
        name: 'SomeObject',
      }))
    ).to.throw(
      'SomeObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

  it('rejects a schema with incorrectly typed fields', () => {
    expect(
      () => schemaWithObject(new GraphQLObjectType({
        name: 'SomeObject',
        fields: [
          { field: GraphQLString }
        ]
      }))
    ).to.throw(
      'SomeObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

  it('rejects a schema with empty fields', () => {
    expect(
      () => schemaWithObject(new GraphQLObjectType({
        name: 'SomeObject',
        fields: {}
      }))
    ).to.throw(
      'SomeObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

  it('rejects a schema with an object type with a field function that returns nothing', () => {
    expect(
      () => schemaWithObject(new GraphQLObjectType({
        name: 'SomeObject',
        fields() {
          return;
        }
      }))
    ).to.throw(
      'SomeObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

  it('rejects a schema with an object type with a field function that returns empty', () => {
    expect(
      () => schemaWithObject(new GraphQLObjectType({
        name: 'SomeObject',
        fields() {
          return {};
        }
      }))
    ).to.throw(
      'SomeObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

});


describe('Type System: Fields args must be objects', () => {

  function schemaWithObject(objectType) {
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          f: { type: objectType }
        }
      })
    });
  }

  it('accepts a schema with an object type with field args', () => {
    expect(
      () => schemaWithObject(new GraphQLObjectType({
        name: 'SomeObject',
        fields: {
          goodField: {
            type: GraphQLString,
            args: {
              goodArg: { type: GraphQLString }
            }
          }
        }
      }))
    ).not.to.throw();
  });

  it('rejects a schema with an object type with incorrectly typed field args', () => {
    expect(
      () => schemaWithObject(new GraphQLObjectType({
        name: 'SomeObject',
        fields: {
          badField: {
            type: GraphQLString,
            args: [
              { badArg: GraphQLString }
            ]
          }
        }
      }))
    ).to.throw(
      'SomeObject.badField args must be an object with argument names as keys.'
    );
  });

});


describe('Type System: Object fields must have output types', () => {

  function schemaWithObjectFieldOfType(fieldType) {
    var BadObjectType = new GraphQLObjectType({
      name: 'BadObject',
      fields: {
        badField: { type: fieldType }
      }
    });

    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          f: { type: BadObjectType }
        }
      })
    });
  }

  outputTypes.forEach(type => {
    it(`accepts a schema with an output type as a field type: ${type}`, () => {
      expect(() => schemaWithObjectFieldOfType(type)).not.to.throw();
    });
  });

  it('rejects a schema with an empty field type', () => {
    expect(() => schemaWithObjectFieldOfType(undefined)).to.throw(
      'BadObject.badField field type must be Output Type but got: undefined.'
    );
  });

  notOutputTypes.forEach(type => {
    it(`rejects a schema with a non-output type as a field type: ${type}`, () => {
      expect(() => schemaWithObjectFieldOfType(type)).to.throw(
        `BadObject.badField field type must be Output Type but got: ${type}.`
      );
    });
  });

});


describe('Type System: Input Objects must have fields', () => {

  function schemaWithInputObject(inputObjectType) {
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          f: {
            type: GraphQLString,
            args: {
              badArg: { type: inputObjectType }
            }
          }
        }
      })
    });
  }

  it('accepts a schema with an object type with fields', () => {
    expect(
      () => schemaWithInputObject(new GraphQLInputObjectType({
        name: 'SomeInputObject',
        fields: {
          f: { type: GraphQLString }
        }
      }))
    ).not.to.throw();
  });

  it('accepts a schema with an object type with a field function', () => {
    expect(
      () => schemaWithInputObject(new GraphQLInputObjectType({
        name: 'SomeInputObject',
        fields() {
          return {
            f: { type: GraphQLString }
          };
        }
      }))
    ).not.to.throw();
  });

  it('rejects a schema with missing fields', () => {
    expect(
      () => schemaWithInputObject(new GraphQLInputObjectType({
        name: 'SomeInputObject',
      }))
    ).to.throw(
      'SomeInputObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

  it('rejects a schema with incorrectly typed fields', () => {
    expect(
      () => schemaWithInputObject(new GraphQLInputObjectType({
        name: 'SomeInputObject',
        fields: [
          { field: GraphQLString }
        ]
      }))
    ).to.throw(
      'SomeInputObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

  it('rejects a schema with empty fields', () => {
    expect(
      () => schemaWithInputObject(new GraphQLInputObjectType({
        name: 'SomeInputObject',
        fields: {}
      }))
    ).to.throw(
      'SomeInputObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

  it('rejects a schema with an object type with a field function that returns nothing', () => {
    expect(
      () => schemaWithInputObject(new GraphQLInputObjectType({
        name: 'SomeInputObject',
        fields() {
          return;
        }
      }))
    ).to.throw(
      'SomeInputObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

  it('rejects a schema with an object type with a field function that returns empty', () => {
    expect(
      () => schemaWithInputObject(new GraphQLInputObjectType({
        name: 'SomeInputObject',
        fields() {
          return {};
        }
      }))
    ).to.throw(
      'SomeInputObject fields must be an object with field names as keys or a ' +
      'function which returns such an object.'
    );
  });

});


describe('Type System: Interface fields must have output types', () => {

  function schemaWithInterfaceFieldOfType(fieldType) {
    var BadInterfaceType = new GraphQLInterfaceType({
      name: 'BadInterface',
      fields: {
        badField: { type: fieldType }
      }
    });

    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          f: { type: BadInterfaceType }
        }
      })
    });
  }


  outputTypes.forEach(type => {
    it(`accepts a schema with an output type as a field type: ${type}`, () => {
      expect(() => schemaWithInterfaceFieldOfType(type)).not.to.throw();
    });
  });

  it('rejects a schema with an empty field type', () => {
    expect(() => schemaWithInterfaceFieldOfType(undefined)).to.throw(
      'BadInterface.badField field type must be Output Type but got: undefined.'
    );
  });

  notOutputTypes.forEach(type => {
    it(`rejects a schema with a non-output type as a field type: ${type}`, () => {
      expect(() => schemaWithInterfaceFieldOfType(type)).to.throw(
        `BadInterface.badField field type must be Output Type but got: ${type}.`
      );
    });
  });

});


describe('Type System: Field arguments must have input types', () => {

  function schemaWithArgOfType(argType) {
    var BadObjectType = new GraphQLObjectType({
      name: 'BadObject',
      fields: {
        badField: {
          type: GraphQLString,
          args: {
            badArg: { type: argType }
          }
        }
      }
    });

    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          f: { type: BadObjectType }
        }
      })
    });
  }

  inputTypes.forEach(type => {
    it(`accepts a schema with an input type as an arg type: ${type}`, () => {
      expect(() => schemaWithArgOfType(type)).not.to.throw();
    });
  });

  it('rejects a schema with an empty arg type', () => {
    expect(() => schemaWithArgOfType(undefined)).to.throw(
      'BadObject.badField(badArg:) argument type must be Input Type but got: undefined.'
    );
  });

  notInputTypes.forEach(type => {
    it(`rejects a schema with a non-input type as an arg type: ${type}`, () => {
      expect(() => schemaWithArgOfType(type)).to.throw(
        `BadObject.badField(badArg:) argument type must be Input Type but got: ${type}.`
      );
    });
  });

});


describe('Type System: Input object fields must have input types', () => {

  function schemaWithInputFieldOfType(inputFieldType) {
    var BadInputObjectType = new GraphQLInputObjectType({
      name: 'BadInputObject',
      fields: {
        badField: { type: inputFieldType }
      }
    });

    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          f: {
            type: GraphQLString,
            args: {
              badArg: { type: BadInputObjectType }
            }
          }
        }
      })
    });
  }

  inputTypes.forEach(type => {
    it(`accepts a schema with an input type as an input field type: ${type}`, () => {
      expect(() => schemaWithInputFieldOfType(type)).not.to.throw();
    });
  });

  it('rejects a schema with an empty input field type', () => {
    expect(() => schemaWithInputFieldOfType(undefined)).to.throw(
      'BadInputObject.badField field type must be Input Type but got: undefined.'
    );
  });

  notInputTypes.forEach(type => {
    it(`rejects a schema with a non-input type as an input field type: ${type}`, () => {
      expect(() => schemaWithInputFieldOfType(type)).to.throw(
        `BadInputObject.badField field type must be Input Type but got: ${type}.`
      );
    });
  });

});