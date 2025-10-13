import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VagasService, Vaga } from '../../services/vagas.service';
import { EventosService, Evento } from '../../services/eventos.service';
import { NoticiasService, Noticia } from '../../services/noticias.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  abaAtiva: 'vagas' | 'eventos' | 'noticias' = 'vagas';
  modoEdicao = false;
  itemEditandoId: number | null = null;

  // Listas
  vagas: Vaga[] = [];
  eventos: Evento[] = [];
  noticias: Noticia[] = [];

  // Formulários
  vagaForm: FormGroup;
  eventoForm: FormGroup;
  noticiaForm: FormGroup;

  // Categorias
  categoriasVagas = ['Programação', 'QA', 'Dados', 'Projetos', 'Produtos', 'Segurança', 'RH', 'Marketing', 'Design', 'Vendas'];
  tiposVagas = ['CLT', 'PJ', 'Estágio', 'Freelance', 'Bootcamp', 'Aprendiz', 'Devops', 'Programa de Aprendizagem'];
  categoriasEventos = ['Tecnologia', 'Inovação', 'Networking', 'Workshop', 'Palestra', 'Hackathon'];
  categoriasNoticias = ['Inovação', 'Tecnologia', 'Empreendedorismo', 'Eventos', 'Startups', 'Investimentos'];

  constructor(
    private fb: FormBuilder,
    private vagasService: VagasService,
    private eventosService: EventosService,
    private noticiasService: NoticiasService
  ) {
    this.vagaForm = this.fb.group({
      titulo: ['', Validators.required],
      empresa: ['', Validators.required],
      tipo: ['', Validators.required],
      descricao: [''],
      link: ['', [Validators.required, Validators.pattern('https?://.+')]],
      categorias: [[], Validators.required],
      destacada: [false]
    });

    this.eventoForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required],
      data: ['', Validators.required],
      horario: ['', Validators.required],
      local: ['', Validators.required],
      link: ['', Validators.pattern('https?://.+')],
      imagem: [''],
      categoria: ['', Validators.required],
      organizador: ['', Validators.required],
      vagas: [null]
    });

    this.noticiaForm = this.fb.group({
      titulo: ['', Validators.required],
      subtitulo: [''],
      conteudo: ['', Validators.required],
      autor: ['', Validators.required],
      dataPublicacao: ['', Validators.required],
      categoria: ['', Validators.required],
      imagem: [''],
      link: ['', Validators.pattern('https?://.+')],
      destaque: [false]
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.vagasService.getAll().subscribe(vagas => this.vagas = vagas);
    this.eventosService.getAll().subscribe(eventos => this.eventos = eventos);
    this.noticiasService.getAll().subscribe(noticias => this.noticias = noticias);
  }

  selecionarAba(aba: 'vagas' | 'eventos' | 'noticias'): void {
    this.abaAtiva = aba;
    this.cancelarEdicao();
  }

  // VAGAS
  salvarVaga(): void {
    if (this.vagaForm.valid) {
      if (this.modoEdicao && this.itemEditandoId) {
        this.vagasService.update(this.itemEditandoId, this.vagaForm.value);
      } else {
        this.vagasService.add(this.vagaForm.value);
      }
      this.vagaForm.reset({ destacada: false, categorias: [] });
      this.cancelarEdicao();
    }
  }

  editarVaga(vaga: Vaga): void {
    this.modoEdicao = true;
    this.itemEditandoId = vaga.id;
    this.vagaForm.patchValue(vaga);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluirVaga(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      this.vagasService.delete(id);
    }
  }

  toggleCategoriaVaga(categoria: string): void {
    const categorias = this.vagaForm.get('categorias')?.value || [];
    const index = categorias.indexOf(categoria);
    if (index > -1) {
      categorias.splice(index, 1);
    } else {
      categorias.push(categoria);
    }
    this.vagaForm.patchValue({ categorias });
  }

  isCategoriaVagaSelecionada(categoria: string): boolean {
    const categorias = this.vagaForm.get('categorias')?.value || [];
    return categorias.includes(categoria);
  }

  // EVENTOS
  salvarEvento(): void {
    if (this.eventoForm.valid) {
      const eventoData = {
        ...this.eventoForm.value,
        data: new Date(this.eventoForm.value.data)
      };
      if (this.modoEdicao && this.itemEditandoId) {
        this.eventosService.update(this.itemEditandoId, eventoData);
      } else {
        this.eventosService.add(eventoData);
      }
      this.eventoForm.reset();
      this.cancelarEdicao();
    }
  }

  editarEvento(evento: Evento): void {
    this.modoEdicao = true;
    this.itemEditandoId = evento.id;
    const dataFormatada = new Date(evento.data).toISOString().split('T')[0];
    this.eventoForm.patchValue({
      ...evento,
      data: dataFormatada
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluirEvento(id: number): void {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      this.eventosService.delete(id);
    }
  }

  // NOTÍCIAS
  salvarNoticia(): void {
    if (this.noticiaForm.valid) {
      const noticiaData = {
        ...this.noticiaForm.value,
        dataPublicacao: new Date(this.noticiaForm.value.dataPublicacao)
      };
      if (this.modoEdicao && this.itemEditandoId) {
        this.noticiasService.update(this.itemEditandoId, noticiaData);
      } else {
        this.noticiasService.add(noticiaData);
      }
      this.noticiaForm.reset({ destaque: false });
      this.cancelarEdicao();
    }
  }

  editarNoticia(noticia: Noticia): void {
    this.modoEdicao = true;
    this.itemEditandoId = noticia.id;
    const dataFormatada = new Date(noticia.dataPublicacao).toISOString().split('T')[0];
    this.noticiaForm.patchValue({
      ...noticia,
      dataPublicacao: dataFormatada
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluirNoticia(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta notícia?')) {
      this.noticiasService.delete(id);
    }
  }

  // GERAL
  cancelarEdicao(): void {
    this.modoEdicao = false;
    this.itemEditandoId = null;
    this.vagaForm.reset({ destacada: false, categorias: [] });
    this.eventoForm.reset();
    this.noticiaForm.reset({ destaque: false });
  }
}
