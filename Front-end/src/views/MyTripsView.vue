<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4">Mes Trajets</h1>

        <div class="alert alert-info" role="alert">
          <i class="bi bi-info-circle"></i>
          Cette fonctionnalité est en cours de développement. Vous pourrez bientôt voir et gérer
          tous vos trajets (conducteur et passager).
        </div>

        <div class="d-grid gap-2">
          <router-link to="/" class="btn btn-primary"> Retour à l'accueil </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyTripsView',
}
</script>
