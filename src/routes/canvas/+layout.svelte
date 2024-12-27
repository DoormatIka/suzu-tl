
<script lang="ts">
  // store internal state for tabs here!
</script>

<div class="h-screen">
  <div class="h-full flex flex-col p-3">
    <div role="tablist" class="tabs tabs-lifted flex-shrink-0">
      <button role="tab" class="tab">Tab 1</button>
      <button role="tab" class="tab tab-active text-primary">Tab 2</button>
      <button role="tab" class="tab">Tab 3</button>
    </div>
    <div class="border px-3 overflow-auto">
      <slot />
    </div>
  </div>
</div>
