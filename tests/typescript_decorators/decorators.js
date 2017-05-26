export class TestTextFileService {
	constructor(
		@ILifecycleService lifecycleService,
	) {
	}
}

@commonEditorContribution
export class TabCompletionController {
}

@Decorarte
class Foo {}

@AutoSubscribeStore
//store in resub, is a class extends from StoreBase.
class HelloStore extends StoreBase {
    @autoSubscribe
    // this method should return a string type
    getHello():string {
        return this._helloString;
    }
}
