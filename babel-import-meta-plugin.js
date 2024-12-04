module.exports = function() {
  return {
    visitor: {
      Program: {
        enter(path) {
          const requireVar = path.scope.generateUidIdentifier('require');
          path.node.body.unshift(
            {
              type: 'VariableDeclaration',
              kind: 'const',
              declarations: [
                {
                  type: 'VariableDeclarator',
                  id: requireVar,
                  init: {
                    type: 'Identifier',
                    name: 'require'
                  }
                }
              ]
            }
          );
          path.scope.registerDeclaration(path.get('body.0'));
        }
      },
      ImportDeclaration(path) {
        if (path.node.source.value === 'module') {
          path.remove();
        }
      },
      MetaProperty(path) {
        if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
          path.replaceWithSourceString('process.cwd()');
        }
      }
    }
  };
};
