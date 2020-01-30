<!-- #7396 -->
<template>
	<MyComponent :attr="`loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong${foo} template literal value`"/>
</template>
<template>
	<MyComponent :attr="`loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong${foo +               bar} template literal value`"/>
</template>
<template>
	<MyComponent :src="'loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong literal string value'"/>
</template>
<template>
	<MyComponent :src="100000000000000000000000000000000000000000000000000000000000000000000000000000"/>
</template>
