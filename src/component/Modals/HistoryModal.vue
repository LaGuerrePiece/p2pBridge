<template>

<!-- The history modal -->

<div class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="font-bold text-lg">History</h3>
    <p class="py-4">Your past bridges and locks</p>
    <div class="modal-action">
      <label for="history-modal" class="btn">Close</label>
    </div>
  </div>
</div>

</template>



<script setup lang="ts">

    import { useRequestStore } from "../../store/requests";
    import { useTicketStore } from "../../store/tickets";

    const requestsStore = useRequestStore();
    const ticketStore = useTicketStore();

    console.log("Request store:", requestsStore);
    console.log("Ticket store:", ticketStore);


</script>