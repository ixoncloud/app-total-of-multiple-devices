<template>
  <button
    class="icon-button"
    ref="button"
    @click="handleClick"
    :disabled="dataExportLoading"
  >
    <div class="spinner" v-if="dataExportLoading">
      <svg
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        viewBox="0 0 100 100"
      >
        <circle cx="50%" cy="50%" r="45"></circle>
      </svg>
    </div>
    <svg width="24" height="24" viewBox="0 0 24 24" v-else>
      <path
        d="M4 15H6V18H18V15H20V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V15Z"
      />
      <path
        d="M13 12.17L15.59 9.59L17 11L12 16L7 11L8.41 9.58L11 12.17L11 4L13 4L13 12.17Z"
      />
    </svg>
  </button>
</template>

<script>
export default {
  name: 'export-button',
  props: ['context', 'client', 'queries', 'exportFilename'],
  data() {
    return {
      dataExportLoading: false,
    };
  },
  methods: {
    handleClick() {
      this.dataExportLoading = true;
      this.cancelQuery = this.client.query(
        { queries: this.queries, format: 'csv' },
        (result) => {
          if (result && 'blob' in result) {
            this.context.saveAsFile(
              result.blob,
              this.exportFilename || 'export.csv',
            );
            if (this.cancelQuery) {
              this.cancelQuery();
              this.cancelQuery = null;
            }
          }
          this.dataExportLoading = false;
        },
      );
    },
  },
  mounted() {
    if (this.$refs.button) {
      this.context.createTooltip(this.$refs.button, {
        message: this.context.translate('EXPORT_TO_CSV'),
      });
    }
  },
  unmounted() {
    if (this.cancelQuery) {
      this.cancelQuery();
    }
  },
};
</script>

<style lang="scss" scoped>
@import './export-button';
</style>
