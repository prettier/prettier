import { computed, watch, Teleport } from "vue";

export default {
  name: "VersionLink",
  props: {
    version: {
      type: String,
      required: true,
    },
  },
  setup({ version }) {
    const match = computed(() => version.match(/^pr-(\d+)$/u));

    const href = computed(() => {
      if (match.value) {
        return `pull/${match.value[1]}`;
      } else if (/\.0$/u.test(version)) {
        return `releases/tag/${version}`;
      } else {
        return `blob/main/CHANGELOG.md#${version.replaceAll(".", "")}`;
      }
    });

    const formattedVersion = computed(() => {
      return match.value ? `PR #${match.value[1]}` : `v${version}`;
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
