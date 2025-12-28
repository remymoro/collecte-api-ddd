#!/bin/bash

# Script pour exécuter les tests unitaires
# Usage: ./run-tests.sh [option]

echo "🧪 Tests Unitaires - collecte-api"
echo "================================="
echo ""

case "$1" in
  "coverage")
    echo "📊 Exécution avec couverture de code..."
    npm test -- --coverage
    ;;
  "watch")
    echo "👀 Mode watch activé..."
    npm test -- --watch
    ;;
  "domain")
    echo "🏛️ Tests du domaine uniquement..."
    npm test -- --testPathPattern="src/tests/domain"
    ;;
  "usecases")
    echo "⚙️ Tests des use cases uniquement..."
    npm test -- --testPathPattern="src/tests/application"
    ;;
  "collecte")
    echo "📦 Tests collecte uniquement..."
    npm test -- --testPathPattern="src/tests.*collecte"
    ;;
  "product")
    echo "🏷️ Tests produit uniquement..."
    npm test -- --testPathPattern="src/tests.*product"
    ;;
  "weight")
    echo "⚖️ Tests Weight value object..."
    npm test -- weight.vo.spec.ts
    ;;
  "entry")
    echo "📝 Tests CollecteEntry..."
    npm test -- collecte-entry.entity
    ;;
  "help"|"-h"|"--help")
    echo "Options disponibles:"
    echo "  coverage     Exécuter avec couverture de code"
    echo "  watch        Mode watch (re-exécution automatique)"
    echo "  domain       Tests du domaine uniquement"
    echo "  usecases     Tests des use cases uniquement"
    echo "  collecte     Tests collecte uniquement"
    echo "  product      Tests produit uniquement"
    echo "  weight       Tests Weight value object"
    echo "  entry        Tests CollecteEntry entity"
    echo "  help         Afficher cette aide"
    echo ""
    echo "Sans option: exécute tous les tests"
    ;;
  *)
    echo "🚀 Exécution de tous les tests..."
    npm test
    ;;
esac
