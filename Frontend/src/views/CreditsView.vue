<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h1 class="text-center mb-4">Mes Crédits</h1>

        <div class="card">
          <div class="card-body">
            <div class="alert alert-info" role="alert">
              <i class="bi bi-info-circle"></i>
              Cette fonctionnalité est en cours de développement. Vous pourrez bientôt gérer vos
              crédits EcoRide, voir l'historique de vos transactions, et gagner des points
              éco-responsables.
            </div>

            <div class="row mt-4">
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body text-center">
                    <h5 class="card-title">Crédits Actuels</h5>
                    <h2 class="text-success">-- €</h2>
                    <small class="text-muted">Bientôt disponible</small>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body text-center">
                    <h5 class="card-title">Points Éco</h5>
                    <h2 class="text-primary">-- pts</h2>
                    <small class="text-muted">Bientôt disponible</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-grid gap-2 mt-4">
              <router-link to="/" class="btn btn-primary"> Retour à l'accueil </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreditsView',
}
</script>
