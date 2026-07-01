.PHONY: validate validate-quick check-duplicates check-secrets

validate:
	./scripts/validate-all.sh

validate-quick:
	./scripts/validate-all.sh --quick

check-duplicates:
	./scripts/check-duplicates.sh

check-secrets:
	./scripts/check-secrets.sh
