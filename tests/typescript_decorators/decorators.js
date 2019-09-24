export class TestTextFileService {
	constructor(
		@ILifecycleService lifecycleService,
	) {
	}
}

@commonEditorContribution
export class TabCompletionController {
}

@Component({
  selector: 'angular-component',
})
class AngularComponent {
  @Input() myInput: string;
}

class Class {
  method(
    @Decorator
    { prop1, prop2 }: Type
  ) {
    doSomething();
  }
}

class Class {
  method(
    @Decorator1
    @Decorator2
    { prop1, prop2 }: Type
  ) {
    doSomething();
  }
}

class Class {
  method(
    @Decorator
    { prop1_1, prop1_2 }: Type,
    { prop2_1, prop2_2 }: Type
  ) {
    doSomething();
  }
}

class Class {
  method(
    param1,
    @Decorator
    { prop1, prop2 }: Type
  ) {}
}

class Class {
  method(
    @Decorator { prop1 }: Type
  ) {}
}
