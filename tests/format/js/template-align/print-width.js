const html = `
	<div>
		<ul>
			${
				items.map((item) => `<li>${item.displayName} (${item.id})</li>`).join("")
			}
		</ul>
	</div>
`;
