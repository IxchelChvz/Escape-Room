"""Consultas reutilizadas por las vistas y por la API."""

from models import Team, Trial


def podio_teams():
    """Los 4 ultimos grupos registrados, de mayor a menor puntuacion (siempre 4 huecos)."""
    ultimos = Team.query.order_by(Team.created_at.desc(), Team.id.desc()).limit(4).all()
    ultimos.sort(key=lambda t: (-(t.score or 0), t.elapsed_seconds or 0))
    puestos = [{"name": t.name, "score": t.score or 0} for t in ultimos]
    while len(puestos) < 4:
        puestos.append(None)
    return puestos


def all_trials():
    return Trial.query.order_by(Trial.num.asc()).all()
