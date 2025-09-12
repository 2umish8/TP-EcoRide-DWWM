<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">Mot de passe oublié</h3>
          </div>
          <div class="card-body">
            <div class="alert alert-warning" role="alert">
              <i class="bi bi-exclamation-triangle"></i>
              Cette fonctionnalité n'est pas encore disponible. Veuillez contacter l'administrateur
              pour réinitialiser votre mot de passe.
            </div>

            <div class="d-grid gap-2">
              <router-link to="/login" class="btn btn-primary"> Retour à la connexion </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPasswordView',
}
</script>
