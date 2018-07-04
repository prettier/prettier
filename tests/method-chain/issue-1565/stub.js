// https://github.com/prettier/prettier/issues/1565#issuecomment-372455046
sandbox.stub(config, 'get').withArgs('env').returns('dev')
sandbox
  .stub(config, 'get')
  .withArgs('env')
  .returns('dev')
