from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Contraseña final configurada en el servidor
FINAL_PASSWORD = "HERACLES.EXE"

@app.route('/')
def home():
    """Renderea la vista principal de la aplicación."""
    return render_template('index.html')

@app.route('/mapa')
def mapa():
    """Renderea la vista del mapa de pruebas."""
    return render_template('mapa.html')

@app.route('/restaurada')
def restaurada():
    """Renderea la vista de restauración exitosa."""
    return render_template('webRestaurada.html')

@app.route('/api/verify', methods=['POST'])
def verify_password():
    """Endpoint para validar la contraseña introducida por el usuario."""
    data = request.get_json()
    user_input = data.get('password', '').upper()
    
    if user_input == FINAL_PASSWORD:
        return jsonify({"success": True, "message": "¡El Olimpo ha sido restaurado!"})
    else:
        return jsonify({"success": False, "message": "Contraseña incorrecta. Revisa los caracteres."})

if __name__ == '__main__':
    app.run(debug=True)