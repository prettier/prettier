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
