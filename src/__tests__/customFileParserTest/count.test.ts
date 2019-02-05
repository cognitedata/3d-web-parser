
    let expectedAttributeCount = 0;
    for (let i = 0; i < properties.length; i++) {
      switch (properties[i]) {
        case 'center':
        case 'delta':
        case 'translation':
        case 'rotation3':
        case 'scale':
          expectedAttributeCount += 3;
          break;
        default:
          expectedAttributeCount += 1;
          break;
      }
    }
    if (attributeCount !== expectedAttributeCount) {
      throw Error('Incorrect atttibute count for type ' + name + '. Expected ' +
      expectedAttributeCount + ', got ' +
      attributeCount);
    }