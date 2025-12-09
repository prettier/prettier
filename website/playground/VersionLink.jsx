import { computed, watch, Teleport } from "vue";

export default {
  name: "VersionLink",
  props: {
    version: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const match = computed(() => props.version.match(/^pr-(\d+)$/u));

    const href = computed(() => {
      if (match.value) {
        return `pull/${match.value[1]}`;
      } else if (/\.0$/u.test(props.version)) {
        return `releases/tag/${props.version}`;
      } else {
        return `blob/main/CHANGELOG.md#${props.version.replaceAll(".", "")}`;
      }
    });

    const formattedVersion = computed(() => {
      return match.value ? `PR #${match.value[1]}` : `v${props.version}`;
    });

    watch(
      formattedVersion,
      (newVersion) => {
        document.title = `Prettier ${newVersion}`;
      },
      { immediate: true },
    );

    return () => (
      <Teleport to="#version">
        <a
          href={`https://github.com/prettier/prettier/${href.value}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          {formattedVersion.value}
        </a>
      </Teleport>
    );
  },
};
