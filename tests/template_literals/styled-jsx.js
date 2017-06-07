<style jsx>{`
	/* a comment */
	div :global(.react-select) {
		color: red; display: none
	}
`}</style>;

<div>
<style jsx>{`
	/* a comment */
div :global(.react-select) {
color: red; display: none
}`}</style>
</div>;

<div>
<style jsx>{`div{color:red}`}</style>
</div>;

<div>
<style jsx>{`This is invalid css. 
      Shouldn't fail.
            Shouldn't be formatted.`}</style>
</div>;
