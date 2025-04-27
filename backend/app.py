import os
from flask import Flask, request, jsonify
from google.generativeai import GenerativeModel, configure
from dotenv import load_dotenv  # Required for .env loading

app = Flask(__name__)


load_dotenv('.env.local')  


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found! Please check .env.local")

configure(api_key=GEMINI_API_KEY)
model = GenerativeModel('gemini-2.0-flash-lite-001')


def build_prompt(npc_state, environment_event,player_health, monster_health,monster_state):
    return f"""
You are a monster in a haunted, cursed mansion.
The player is nearby.
The player is feeling {npc_state} after {environment_event}. You are trying to scare them and are stronger that them.
The player is at {player_health} health and the you are at {monster_health} health. If {player_health} is less than 0, the player is dead.
If {monster_health} is less than 0, then You are dead and you need to act surprised and accept your defeat.
Only 1-2 sentences. Do not break character accoding to your {monster_state} act .
"""

@app.route('/generate-dialogue', methods=['POST'])
def generate_dialogue():
    try:
        data = request.get_json()
        npc_state = data['npc_state']  
        monster_state = data['monster_state']
        environment_event = data['environment_event']
        player_health = data['player_health']
        monster_health = data['monster_health']


        # if player_health <=0 :
        #     npc_state= "dead"
        # elif monster_health <= 0:
        #     npc_state= "Won & confident"
        
        response = model.generate_content(
            build_prompt(npc_state, environment_event,player_health, monster_health,monster_state))
        
        return jsonify({
            'dialogue': response.text.strip(),
            'status': 'success'
        })
    
    except KeyError:
        return jsonify({'error': 'Missing required fields'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)